const API_URL = "http://localhost:3000/traceTransactionToCoinbase";

const startTracer = async () => {
	document.getElementById("infoPromptList").innerHTML = "";
  addToInfo("Tracing started...")
  freezeGui();
  const targetTransactionID = document.getElementById("targetTransaction").value;

  try {
    console.log(targetTransactionID)
    const response = await axios.post(API_URL, {
      targetTransactionID,
    }, {
        headers: {
          "Content-Type": "application/json",
        }
      });
    if (response.status === 200) {
      linkFound(response)
    } else {
      throw new Error(response.error || 'Unknown error occurred');
    }
  } catch (error) {
    handleError('startTracer', error);
  }
};

const linkFound = result => {
  const targetList = document.getElementById("infoPromptList");
  let successMessage = document.createElement("li");
  let headline = document.createElement("p");
  headline.textContent = result.data.message;

  let coinbases = result.data.data.coinbases;
  let coinbaseList = document.createElement("ul");
  let coinbaseHeadLine = document.createElement("li")
  if (coinbases.length > 0) {
    coinbaseHeadLine.textContent = `Coinbases found (${coinbases.length}):`;
    coinbaseList.appendChild(coinbaseHeadLine)
    for (let cb of coinbases) {
      let coinbaseElement = document.createElement("li");
      coinbaseElement.textContent = `Blockheight: ${cb.blockheight}, Blockhash: ${cb.blockhash}, Coinbasetransaction: ${cb.txid}`
      coinbaseList.appendChild(coinbaseElement);
    }
  } else {
    coinbaseHeadLine.textContent = "No Coinbases found";
    coinbaseList.appendChild(coinbaseHeadLine)
  }

  let transactions = result.data.data.transactions;
  let transactionList = document.createElement("ul");
  let transactionsHeadLine = document.createElement("li")
  if (transactions.length > 0) {
    transactionsHeadLine.textContent = `Transactions found (${transactions.length}):`;
    transactionList.appendChild(transactionsHeadLine)
    for (let tx of transactions) {
      let transactionElement = document.createElement("li");
      transactionElement.textContent = `Blockheight: ${tx.blockheight}, TransactionID: ${tx.txid}, `
      transactionList.appendChild(transactionElement);
    }
  } else {
    transactionsHeadLine.textContent = "No Transactions found";

  }

  successMessage.appendChild(headline);
  successMessage.appendChild(coinbaseList);
  successMessage.appendChild(transactionList);
  targetList.appendChild(successMessage);
};

const handleError = (functionName, error) => {
  const targetList = document.getElementById("infoPromptList")
  let newListElement = document.createElement("li")
  newListElement.textContent = `Error in ${functionName}: ${error}`
  targetList.appendChild(newListElement)
}

const addToInfo = infoText => {
  const targetList = document.getElementById("infoPromptList")
  let newListElement = document.createElement("li")
  newListElement.textContent = infoText;
  targetList.appendChild(newListElement)

}

const freezeGui = () => {

}

document.getElementById("masterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  startTracer();
});

