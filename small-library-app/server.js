// server.js:
// Responsible for configuring and starting the Apollo Server.
const { ApolloServer } = require("@apollo/server"); // Import Apollo Server class to handle GraphQL logic.
const { startStandaloneServer } = require("@apollo/server/standalone"); // Import helper function to create a standalone server instance.
const jwt = require("jsonwebtoken"); // Import JSON Web Token library to decode and validate security tokens sent from the frontend.

const User = require("./models/user"); // Import the Mongoose User model. Required to find the user in Db.
const resolvers = require("./resolvers"); // Import resolver functions (logic that fetches data for your GraphQL queries/mutations).
const typeDefs = require("./schema"); // Import GraphQL schema definitions (Type Definitions), defining our API structure.
// Retrieve secret key from environment variables for security, or defaults to a hardcoded string for development.
const JWT_SECRET = process.env.JWT_SECRET || "HARD_CODED_JWT_SECRET";
// port(parameter), assigned value of PORT (argument) used in startServer(PORT) in index.js.
const startServer = (port) => {
  const server = new ApolloServer({
    // Creates a new ApolloServer instance by combining our schema (typeDefs) and logic (resolvers).
    typeDefs,
    resolvers,
  });
  // Start the standalone server and begin listening for incoming HTTP requests on the specified port.
  startStandaloneServer(server, {
    listen: { port },
    // Context function: runs for EVERY incoming request before it reaches our resolvers.
    context: async ({ req, res }) => {
      // If request exists, extract and assign the 'authorization' field from the HTTP header.
      const auth = req ? req.headers.authorization : null; // Extract Authorisation header.

      if (auth && auth.startsWith("Bearer ")) {
        // if there is authorisation in the header and it starts with 'Bearer' .. Strip 'Bearer ' (first 7 chars), verify token and place in decodedToken var.
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
        // Find the user in the Db by the id in the token, and assign to currentUser
        const currentUser = await User.findById(decodedToken.id);

        // currentUser object is passed as the 'context' argument to all resolvers.
        return { currentUser };
      }
    },
  }).then(({ url }) => {
    // Once the server starts successfully, it returns a Promise that resolves with the server's URL.
    console.log(`Server ready at ${url}`); // Log the URL (i.e.: http://localhost:4001) so I know where to point the btowser to find the Apollo Client.
  });
};
// Export the startServer function so it can be triggered from your main index.js file.
module.exports = startServer;
