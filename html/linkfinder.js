const API_URL = "http://localhost:3000/traceTransactions";

const startTracer = async () => {
addToInfo("Tracing started...")
  freezeGui();
  const startTransactionID = document.getElementById("startTransaction").value;
  const targetTransactionID = document.getElementById("targetTransaction").value;

  try {
    console.log(startTransactionID)
    console.log(targetTransactionID)
    const response = await axios.post(API_URL, {
      startTransactionID,
      targetTransactionID,
    }, {
        headers: {
          "Content-Type": "application/json",
        }
      });

    if (response.status === 200) {
      let [...resultArray] = response.data.data.path;
      linkFound(resultArray)
      // Ergebnis verarbeiten und anzeigen
      //addToInfo(`Trace completed: ${response.data.data.path}`);
    } else {
      throw new Error(response.error || 'Unknown error occurred');
    }
  } catch (error) {
    handleError('startTracer', error);
  }
};

const linkFound = array => {
  const targetList = document.getElementById("infoPromptList")
  let successMessage = document.createElement("li")
  let headline = document.createElement("p")
  headline.textContent = "A link was found:"
  successMessage.appendChild(headline)
  array.forEach(item => {
    let newListElement = document.createElement("p")
    newListElement.textContent = `Transaction ${item.txid}`;
    successMessage.appendChild(newListElement)
    targetList.appendChild(successMessage)
  })
}

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
