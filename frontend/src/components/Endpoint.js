import react, { useState } from 'react'

const Endpoint = ( {apiURL, onEndpointChange}) => {
  const [endPoint, setEndpoint] = useState(apiURL)

  const handleChange = event => {
    setEndpoint(event.target.value)
  }
  const handleSubmit = event => {
    event.preventDefault();
    onEndpointChange(endPoint)
  }
  const handleReset = () => {
    setEndpoint("http://localhost:3000/")
    onEndpointChange(endPoint)
  }

  return (
   <div className="Endpoint"> 
    <details>
      <summary>Endpoint Configuration</summary>
      <form  onSubmit={handleSubmit}>
        <input onChange={handleChange} value={endPoint} required/>
        <button type="submit">Change Endpoint</button>
        <button onClick={handleReset}>Reset to http://localhost:3000/</button>
      </form>
    </details>
    </div>
  ) 
}

export default Endpoint
