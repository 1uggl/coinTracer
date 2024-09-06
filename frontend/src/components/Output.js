import react, { useState } from 'react'

const Output = ( { transaction, endPoint, coinbases, transactions }) => {
  transactions.sort((a, b) =>  b.blockheight - a.blockheight)
  return (
    <div className="Output">
      {coinbases.length !== 0 ? <h3>Found coinbases: {coinbases.length}</h3> : <h3>No coinbases found until now</h3>}
      {coinbases.map(result => {
        return (
          <>
            <p>Blockheight: {result.blockheight}</p>
            <p>Blockhash: {result.blockhash}</p>
          </>
        )
      })}

      {transactions.length !== 0 ? <h3>Found transactions: {transactions.length}</h3> : <h3>No transactions found until now</h3>}
      {transactions.map(result => {
        return (
          <>
            <p>Blockheight: {result.blockheight}</p>
            <p>Blockhash: {result.blockhash}</p>
          </>
        )
      })}
    </div>
  )
}

export default Output
