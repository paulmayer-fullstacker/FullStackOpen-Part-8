// db.js:
// Connecting to MongoDB
const mongoose = require("mongoose"); // Imports mongoose library (an Object Data Modeling (ODM) tool for MongoDB and Node.js).
// Define asynchronous function that takes the (uri) connection string as argument.
const connectToDatabase = async (uri) => {
  // mongoose.set("strictQuery", false); // Maintain consistency through newer versins of Mongoos. In v6, strictQuery===false by default, v7 strictQuery===true.
  console.log("connecting to database URI:", uri); // Log connection attempt. Helpful for debugging (check if the URI is being loaded correctly from environment variables).

  try {
    // Attempts to establish a connection to MongoDB; 'await' pauses execution until the connection succeeds or fails.
    await mongoose.connect(uri);
    console.log("connected to MongoDB"); // If successful, logs a confirmation message to the console.
  } catch (error) {
    // If an error occurs during connection, log specific error message.
    console.log("error connection to MongoDB:", error.message);
    // Then, terminate the Node.js process with a 'failure' code (1), preventing the server from running without a database.
    process.exit(1);
  }
};
// Exports the function so it can be imported and called in your main entry point (index.js / connectToDatabase(MONGODB_URI)).
module.exports = connectToDatabase;
