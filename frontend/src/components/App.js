import '../css/App.css';
import Header from './Header'
import Input from './Input.js'
import Output from './Output.js'
import react, { useState } from 'react'

function App() {
  const [transaction, setTransaction] = useState("")

  const handleInput = response => {
    setTransaction(response)
  }

  return (
    <>
    <Header />
    <Input txid={transaction} onInputChange={handleInput}/>
    <Output />
    </>
  );
}

export default App;
