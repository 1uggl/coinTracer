import react, { useState } from 'react'

const Input = ( { transaction, onInputChange, tracer }) => {
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
      <label for="tx-input"><h3>Input your Transaction ID:</h3></label>
      <div className= "Input-Box">
        <input id="tx-input" value={input} onChange={handleChange} required />
        <button type="submit">Check Transaction</button>
      </div>
      <p>{tracer}</p>
    </form>
  )
}

export default Input
