// server.js:
// Responsible for configuring and starting the Apollo Server.
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");
const { ApolloServer } = require("@apollo/server"); // Import Apollo Server class to handle GraphQL logic.
// const { startStandaloneServer } = require("@apollo/server/standalone"); // Import helper function to create a standalone server instance.

//const { expressMiddleware } = require("@apollo/server/express4"); // Changed from standalone
const { expressMiddleware } = require("@as-integrations/express5");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const http = require("http");

const jwt = require("jsonwebtoken"); // Import JSON Web Token library to decode and validate security tokens sent from the frontend.
const cors = require("cors");
const User = require("./models/user"); // Import the Mongoose User model. Required to find the user in Db.
const resolvers = require("./resolvers"); // Import resolver functions (logic that fetches data for your GraphQL queries/mutations).
const typeDefs = require("./schema"); // Import GraphQL schema definitions (Type Definitions), defining our API structure.
// Retrieve secret key from environment variables for security, or defaults to a hardcoded string for development.
const JWT_SECRET = process.env.JWT_SECRET || "HARD_CODED_JWT_SECRET";

const startServer = async (port) => {
  const app = express();
  const httpServer = http.createServer(app);

  // Setup WebSocket server for Subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/", // Subscription endpoint
  });

  // Create a schema instance (required for subscriptions)
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const serverCleanup = useServer({ schema }, wsServer);

  // Setup Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        // Proper shutdown for the WebSocket server
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  // Must start the Apollo Server before applying middleware
  await server.start();

  // Apply Middleware (Handling Auth for HTTP here)
  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // req exists for HTTP requests, but will be undefined for WebSocket (subscription) connections.
        // This means context.currentUser will be null for subscriptions.
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer ")) {
          // Verify jwt and then find user.
          const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    }),
  );

  httpServer.listen(port, () => {
    console.log(`Server is now running on http://localhost:${port}`);
    console.log(`Subscriptions are ready at ws://localhost:${port}`);
  });
};

module.exports = startServer;
