import '../css/App.css';
import Header from './Header.js'
import Endpoint from './Endpoint.js'
import Input from './Input.js'
import Output from './Output.js'
import react, { useState } from 'react'

const App = () => {
  const [transaction, setTransaction] = useState("")

  const handleInput = response => {
    setTransaction(response)
  }
  const [apiURL, setApiURL] = useState("http://localhost:3000/")

  const handleEndpoint = response => {
    setApiURL(response)
  }

  return (
    <>
    <Header />
    <Input transaction={transaction} onInputChange={handleInput}/>
    <Output transaction={transaction} endPoint={apiURL}/>
    <Endpoint apiURL={apiURL} onEndpointChange={handleEndpoint}/>
    </>
  );
}

export default App;
