import react, { useState } from 'react'

const Output = ( { transaction, endPoint }) => {
  return (
  <div className="Output">
     <h3>Result</h3> 
      <p>{transaction}</p>
      <p>{endPoint}</p>
      
  </div>
  )
}

export default Output
