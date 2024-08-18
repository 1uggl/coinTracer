// test.js
import axios from 'axios';

// Die URL der API
const API_URL = 'http://localhost:3000/traceTransactionToCoinbase';

// Funktion zur Durchführung des Tests
const testTraceTransactions = async (transactionId) => {
  try {
    const response = await axios.post(API_URL, {
      transactionId,
    });

    console.log('Full API Response:', response.data); // Debugging-Ausgabe
  } catch (error) {
    console.error('Error calling API:', error.message);
  }
};

// Beispiel-Transaktions-IDs zum Testen
const targetTransactionID = 'a6b034af04dc59d8a9c2b688c9ccdd50a1bc6eea50d10701448ce038c150d68a';

// Test durchführen
testTraceTransactions(targetTransactionID);

