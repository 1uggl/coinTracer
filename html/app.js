const API_URL = "http://localhost:3000/traceTransactions";
// Add values to the 2 input fields to test faster
document.getElementById("startTransaction").value="84a6f5a3b8b503f0c1e88466c68040e10a0637cbf86050f4d658db8763966326"
document.getElementById("targetTransaction").value="923947de0a9726756d155625a1bdeb1d277e4f7436e3900bee5e3d5b17fd9843"

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
