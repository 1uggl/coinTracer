import react, { useState } from 'react'

const Input = () => {
  const [input, setInput] = useState("");
  const handleSubmit = event => {
    event.preventDefault();
    alert("Läuft!")
  }
return (
  <form onSubmit={handleSubmit}>
  <label for="tx-input">Input your Transaction ID:</label>
  <input id="tx-input" />
  <button type="submit">Check Transaction</button>
  </form>
)
}

export default Input
