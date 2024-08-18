import express from 'express';
import tls from 'tls';

//HOPS for frontend development
let hops = 1000;

const app = express();
const PORT = 3000;

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

// Funktion zur Abfrage der Transaktion von Fulcrum
const getTransactionFromFulcrum = (txid) => {
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

  const recursiveSearchToCoinbase = async (transactionId, checkedTransactions = [], foundCoinbases = []) => {

    const processingTransaction = await getTransactionFromFulcrum(transactionId);
    hops--
    console.log("Processing Transaction: " + processingTransaction.txid);
    checkedTransactions.push(processingTransaction);

    // Prüfen, ob die Transaktion eine Coinbase ist
    if (processingTransaction.vin.length === 1 && !processingTransaction.vin[0].txid) {
      console.log("Coinbase reached");
      foundCoinbases.push(processingTransaction);
      return { foundCoinbases, checkedTransactions };
    }

    if (hops > 0) {
      // Rekursiv durch alle Vorgänger-Transaktionen suchen
      for (let vin of processingTransaction.vin) {
        if (vin.txid) {
          try {
            let newTransaction = await getTransactionFromFulcrum(vin.txid);
            const result = await recursiveSearchToCoinbase(newTransaction.txid, checkedTransactions, foundCoinbases);
            // Es werden keine frühzeitigen Rückgaben durchgeführt, da wir alle Coinbases finden wollen.
          } catch (e) {
            console.error("Fehler in der Suche nach der Coinbase:", e.message);
          }
        }
      }
    }
    return { foundCoinbases, checkedTransactions };
  };

  return await recursiveSearchToCoinbase(transactionId);
};

// Funktion zur Verfolgung der Transaktionen rückwärts
const traceTransactions = async (startTxid, targetTxid) => {
  const startTransaction = await getTransactionFromFulcrum(startTxid)
  const targetTransaction = await getTransactionFromFulcrum(targetTxid)

  const recursiveSearch = async (transaction, array = []) => {
    console.log("Aktuelle transaction: " + transaction.txid)
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

// Route für die Transaktionsverarbeitung
app.post('/traceTransactions', async (req, res) => {
  const { startTransactionID, targetTransactionID } = req.body;

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
  console.log("Received request for tracing Transaction:", req.body.transactionId)
  const { transactionId } = req.body;
  try {
    const result = await traceTransactionToCoinbase(transactionId);
    console.log("Work finished, sending response")

    res.json({
      message: 'Trace completed successfully',
      data: {
        transactions: result.checkedTransactions,
        coinbases: result.foundCoinbases,
        //adresses: result.foundAdresses,

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

