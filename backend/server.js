import express from 'express';
import tls from 'tls';


const app = express();
const PORT = 3001;

app.use(express.json()); // Middleware zum Verarbeiten von JSON-Daten
// Middleware zum Setzen des CORS-Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Erlaubt Anfragen von allen Quellen. Du kannst hier spezifische URLs angeben.
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Fulcrum-Server-Konfiguration
const options = {
  host: '192.168.178.210',
  port: 50002,
  rejectUnauthorized: false, // Set this to true in production
};

const convertConfirmationsToHeight = result => {
  result.foundCoinbases.forEach(tx => {
    tx.blockheight = result.blockHeight - tx.confirmations
  })
  result.checkedTransactions.forEach(tx => {
    tx.blockheight = result.blockHeight - tx.confirmations
  })
  result.foundCoinbases.sort((a, b) => a.blockheight - b.blockheight)
  result.checkedTransactions.sort((a, b) => a.blockheight - b.blockheight)
}

const getBlockheight = () => {
  console.log("Getting Blockheight")
  return new Promise((resolve, reject) => {

    const client = tls.connect(options, () => {
      const request = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'blockchain.headers.subscribe',
        params: [],
      });
      client.write(request + '\n');
    });

    client.on('data', (data) => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.error) {
            console.error('Fulcrum error:', parsedData.error);
            reject(new Error('Error from Fulcrum: ' + parsedData.error.message));
          } else {
            resolve(parsedData.result.height + 1);
          }
        } catch (e) {
          console.error('Failed to parse response:', e.message);
          reject(new Error('Failed to parse response'));
        } finally { 
          client.end() //end the connection to keep under the limit of fulcrum
        }
      }
    );

    client.on('error', (error) => {
      console.error('Error during TLS connection:', error.message);
      reject(error);
    });
  });
};
// Funktion zur Abfrage der Transaktion von Fulcrum
const getTransactionFromFulcrum = (txid) => {
  console.log("Passing TX to fulcrum", txid)
  return new Promise((resolve, reject) => {
    let dataBuffer = "";

    const client = tls.connect(options, () => {
      const request = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'blockchain.transaction.get',
        params: [txid, true],
      });
      client.write(request + '\n');
    });

    client.on('data', (data) => {
      dataBuffer += data.toString();
      if (dataBuffer.includes("}}")) {
        try {
          const parsedData = JSON.parse(dataBuffer);
          if (parsedData.error) {
            console.error('Fulcrum error:', parsedData.error);
            reject(new Error('Error from Fulcrum: ' + parsedData.error.message));
          } else {
            resolve(parsedData.result);
          }
        } catch (e) {
          console.error('Failed to parse response:', e.message);
          reject(new Error('Failed to parse response'));
        } finally { 
          client.end() //end the connection to keep under the limit of fulcrum
        }
      }
    });

    client.on('error', (error) => {
      console.error('Error during TLS connection:', error.message);
      reject(error);
    });
  });
};

const traceTransactionToCoinbase = async (transactionId) => {
let hops = 50;
  let blockHeight;

  try {
    blockHeight = await getBlockheight();
    console.log("Block Height:", blockHeight)
  } catch (error) {
    console.log("Error fetching Block Height:", error.message)
    return
  }

  const recursiveSearchToCoinbase = async (transactionId, checkedTransactions = [], foundCoinbases = []) => {
    const processingTransaction = await getTransactionFromFulcrum(transactionId);

    hops--;
    checkedTransactions.push(processingTransaction);

    // Prüfen, ob die Transaktion eine Coinbase ist
    if (processingTransaction.vin.length === 1 && !processingTransaction.vin[0].txid) {
      console.log("Coinbase reached");
      foundCoinbases.push(processingTransaction);
    return { foundCoinbases, checkedTransactions, blockHeight };
    }

    if (hops > 0) {
      // Rekursiv durch alle Vorgänger-Transaktionen suchen
      for (let vin of processingTransaction.vin) {
        if (vin.txid && !checkedTransactions.some(tx => tx.txid === vin.txid)) {
          try {
            const result = await recursiveSearchToCoinbase(vin.txid, checkedTransactions, foundCoinbases);
            foundCoinbases = result.foundCoinbases;
            checkedTransactions = result.checkedTransactions;
          } catch (e) {
            console.error("Fehler in der Suche nach der Coinbase:", e.message);
          }
        }
      }
    }

    return { foundCoinbases, checkedTransactions, blockHeight };
  };

  return await recursiveSearchToCoinbase(transactionId);
};

// Funktion zur Verfolgung der Transaktionen rückwärts
const traceTransactions = async (startTxid, targetTxid) => {
  const startTransaction = await getTransactionFromFulcrum(startTxid)
  const targetTransaction = await getTransactionFromFulcrum(targetTxid)

  const recursiveSearch = async (transaction, array = []) => {
    array.push(transaction)
    if (transaction.txid === startTxid) {
      console.log("Link found: " + array)
      return array
    }
    if (transaction.vin.length === 1 && !transaction.vin[0].txid) {
      console.log("Coinbase reached: " + array)
      return []
    }
    if (transaction.confirmations > startTransaction.confirmations) {
      console.log("Overshoot: " + array)
      return []
    }

    for (let vin of transaction.vin) {
      if (vin.txid) {
        try {
          let newTransaction = await getTransactionFromFulcrum(vin.txid)
          const result = await recursiveSearch(newTransaction, [...array])
          if (result.length > 0) {
            return result
          }
        } catch(e) {
          console.error("Fehler während der rekursiven Suche:", + e.message)
          return []
        }
      }
    }
  }

  let result = await recursiveSearch(targetTransaction);
  if (result) {
    return result
  }
}

//Route for getting one transaction
app.post('/getTransaction', async (req, res) => {
  const { transactionId } = req.body;
  console.log("Received Request for transaction:", transactionId)
  try {
    const result = await getTransactionFromFulcrum(transactionId);
    console.log("Work finished, sending response")
    res.json({
      message: 'Trace completed successfully',
      data: {
        result,
      }});
  } catch (error) {
    console.error('Error processing transactions:', error.message);
    res.status(500).json({ error: 'Error processing transactions', details: error.message });
  }
});

// Route für die Transaktionsverarbeitung
app.post('/traceTransactions', async (req, res) => {
  const { startTransactionID, targetTransactionID } = req.body;
  console.log("Received request for finding link between " + startTransactionID + " and " + targetTransactionID)
  try {
    const path = await traceTransactions(startTransactionID, targetTransactionID);
    console.log("Work finished, sending response")
    res.json({
      message: 'Trace completed successfully',
      data: {
        linkFound: true,
        path,
      }});
  } catch (error) {
    console.error('Error processing transactions:', error.message);
    res.status(500).json({ error: 'Error processing transactions', details: error.message });
  }
});

app.post('/traceTransactionToCoinbase', async (req, res) => {
  const targetTransactionID = req.body.transactionId;
  console.log("Received request for tracing Transaction:", targetTransactionID);
  try {
    const result = await traceTransactionToCoinbase(targetTransactionID);
    console.log("Work finished, processing result")
convertConfirmationsToHeight(result)
    console.log("Coinbases found:", result.foundCoinbases.length)
    console.log("Transactions processed:", result.checkedTransactions.length)
    res.json({
      message: 'Trace completed successfully',
      data: {
        transactions: result.checkedTransactions,
        coinbases: result.foundCoinbases,
blockheight: result.blockHeight
      }});
  } catch (error) {
    console.error('Error tracing to Coinbase', error.message);
    res.status(500).json({ error: 'Error tracing to Coinbase', details: error.message });
  }
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

