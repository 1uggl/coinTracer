import tls from 'tls';

const options = {
  host: '192.168.178.210', // IP-Adresse deines Fulcrum-Servers
  port: 50002,
  rejectUnauthorized: false, // Set this to true in production
};

const client = tls.connect(options, () => {
  console.log('Connected to Fulcrum server');
});

client.on('end', () => {
  console.log('Disconnected from server');
});

client.on('error', (error) => {
  console.error('Error:', error);
});

document.getElementById("startTransaction").value = "84a6f5a3b8b503f0c1e88466c68040e10a0637cbf86050f4d658db8763966326";
document.getElementById("targetTransaction").value = "923947de0a9726756d155625a1bdeb1d277e4f7436e3900bee5e3d5b17fd9843";
let retrievedTransactions = [];
let startingTransactionID;
let targetTransactionID;
let startingTransaction;
let targetTransaction;
let searchIsNotFinished;

const handleError = (functionName, error) => {
  const targetList = document.getElementById("infoPromptList");
  let newListElement = document.createElement("li");
  newListElement.textContent = `Error in ${functionName}: ${error}`;
  targetList.appendChild(newListElement);
};

const addToInfo = infoText => {
  const targetList = document.getElementById("infoPromptList");
  let newListElement = document.createElement("li");
  newListElement.textContent = infoText;
  targetList.appendChild(newListElement);
};

const startTracer = async () => {
  searchIsNotFinished = true;
  console.log("Search starting");
  document.getElementById("infoPromptList").innerHTML = "";
  await updateValues();
  traceIDsAndCreateArray(targetTransaction);
};

const traceIDsAndCreateArray = async (transaction, array = []) => {
  array.push(transaction);
  if (transaction.txid === startingTransactionID) {
    console.log("We found the link: " + array);
    searchIsNotFinished = false;
    linkFound([...array]);
  } 
  if (transaction.vin.length === 1 && transaction.vin[0].txid === "0000000000000000000000000000000000000000000000000000000000000000") {
    console.log("Coinbase transaction reached:", array);
    return;
  }
  if (transaction.block_height < startingTransaction.block_height) {
    console.log("Overshoot:", array);
    return;
  }
  if (searchIsNotFinished) {
    for (let vin of transaction.vin) {
      let newTransaction = await getTransactionByID(vin.txid);
      traceIDsAndCreateArray(newTransaction, [...array]);
    }
  }
};

const getTransactionByID = (transactionID) => {
  return new Promise((resolve, reject) => {
    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'blockchain.transaction.get',
      params: [transactionID, true], // `true` für verbose Ausgabe
    });

    client.write(request + '\n');

    client.once('data', (data) => {
      const response = JSON.parse(data.toString());
      if (response.error) {
        reject(response.error.message);
      } else {
        resolve(response.result);
      }
    });

    client.once('error', (error) => {
      reject(error);
    });
  });
};
