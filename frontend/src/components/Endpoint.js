import react, { useState } from 'react'

const Endpoint = ({ apiURL, onEndpointChange, statusMessage }) => {
  const [endPoint, setEndpoint] = useState(apiURL)

  const handleChange = event => {
    setEndpoint(event.target.value)
  }
  const handleSubmit = event => {
    event.preventDefault();
    onEndpointChange(endPoint)
    statusMessage("Endpoint changed")
  }
  const handleReset = event => {
    event.preventDefault();
    const resetEndpoint = "http://localhost:3001/"
    setEndpoint(resetEndpoint)
    onEndpointChange(resetEndpoint)
    statusMessage("Endpoint restored")
  }

  return (
   <div className="Endpoint"> 
    <details>
      <summary>Endpoint Configuration</summary>
      <form  onSubmit={handleSubmit}>
        <input onChange={handleChange} value={endPoint} required/>
        <button type="submit">Change Endpoint</button>
        <button onClick={handleReset}>Reset to http://localhost:3001/</button>
      </form>
    </details>
    </div>
  ) 
}

export default Endpoint
