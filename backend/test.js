// test.js
import axios from 'axios';

// Die URL der API
const API_URL = 'http://localhost:3000/traceTransactions';

// Funktion zur Durchführung des Tests
const testTraceTransactions = async (startTransactionID, targetTransactionID) => {
  try {
    const response = await axios.post(API_URL, {
      startTransactionID,
      targetTransactionID,
    });

    console.log('Full API Response:', response.data); // Debugging-Ausgabe
    console.log('Path:', response.data.data.path); // Erwartete Ausgabe
  } catch (error) {
    console.error('Error calling API:', error.message);
  }
};

// Beispiel-Transaktions-IDs zum Testen
const startTransactionID = '0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9';
const targetTransactionID = 'a3b0e9e7cddbbe78270fa4182a7675ff00b92872d8df7d14265a2b1e379a9d33';

// Test durchführen
testTraceTransactions(startTransactionID, targetTransactionID);

