import react, { useState } from 'react'

const Input = ( { className, transaction, onInputChange }) => {
  const [input, setInput] = useState(transaction)

  const handleChange = event => {
    setInput(event.target.value)
  }

  const handleSubmit = event => {
    event.preventDefault();
    onInputChange(input)
  }
  return (
    <form className="Input" onSubmit={handleSubmit}>
      <label for="tx-input">Input your Transaction ID:</label>
      <div className= "Input-Box">
        <input id="tx-input" value={input} onChange={handleChange} required />
        <button type="submit">Check Transaction</button>
      </div>
    </form>
  )
}

export default Input
