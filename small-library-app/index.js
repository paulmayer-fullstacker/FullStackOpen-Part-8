// index.js:
// Program Controler: Responsibility is the startup logic, ensuring that parts of the application are started in the correct order (DB first, then Server).
require("dotenv").config(); // Load env variables from .env file into process.env.

const connectToDatabase = require("./db"); // Import the Db connection helper.
const startServer = require("./server"); // Import the Apollo Server factory.

const MONGODB_URI = process.env.MONGODB_URI; // Retrieve Db connection string from process.env.
const PORT = process.env.PORT || 4001; // Retrieve server port from process.env, or defaults to 4001.
// async/await syntax can only be used inside functions. So, define a main function that handles starting the application. This allows us to call the function that creates the database connection using the await keyword.
const main = async () => {
  await connectToDatabase(MONGODB_URI);
  // Connect to DB first, then launch the server.
  startServer(PORT);
};

main();
