import '../css/App.css';
import Header from './Header.js'
import Endpoint from './Endpoint.js'
import Input from './Input.js'
import Output from './Output.js'
import react, { useState } from 'react'

const App = () => {
  const [tracerStatus, setTracerStatus] = useState("Ready to trace");
  const handleStatus = response => {
    setTracerStatus(response)
  }

  const [apiURL, setApiURL] = useState("http://localhost:3001/")
  const handleEndpoint = response => {
    setApiURL(response)
  }

  const [coinbases, setCoinbases] = useState([]);
  const [transactions, setTransactions] = useState([])
  const [transaction, setTransaction] = useState("");

  const handleInput = answer => {
    const transactionId = answer
    const sendRequest = async () => {
      const API_URL = apiURL + "traceTransactionToCoinbase";
      try {
        setTracerStatus("Tracing Coins...")
        console.log("Sending request")
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({transactionId}),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          console.log(data.data.coinbases)
          setCoinbases(data.data.coinbases);
          setTransactions(data.data.transactions)
          setTracerStatus(data.message);
        } else {
          setTracerStatus("Error: Unable to trace transaction");
        }
      } catch (error) {
        console.error("Error:", error);
        setTracerStatus("Network error");
      }
    };
    sendRequest()
  }


  return (
    <>
      <Header />
      <Input transaction={transaction} onInputChange={handleInput} tracer={tracerStatus}/>
      <Output transaction={transaction} endPoint={apiURL} coinbases={coinbases} transactions={transactions}/>
      <Endpoint apiURL={apiURL} onEndpointChange={handleEndpoint} statusMessage={handleStatus}/>
    </>
  );
}

export default App;
