// src/main.jsx:
import { StrictMode } from "react"; // Import StrictMode component: help identify common bugs during development.
import { createRoot } from "react-dom/client"; // Import createRoot: API for rendering a React app into the HTML DOM.
import App from "./App.jsx"; // Import our main application component from App.jsx.
// Import core Apollo tools: the client, HTTP connection, and a local caching.
import {
  ApolloClient,
  ApolloLink, // ApolloLink used for HTTP/WS .split() method.
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react"; // Import ApolloProvider component. Used to make the Apollo Client available to the rest of the app.
// Request interceptor: Automatically modify the metadata (context) of a GraphQL request (the HTTP Headers), just before the browser sends it to the server.
import { SetContextLink } from "@apollo/client/link/context";

// Subscription imports:
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

// Setup the Authentication link (middleware)
const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem("admin-user-token");
  return {
    headers: {
      ...headers,
      // 'Bearer' is the standard OAuth2 schema name indicating the token is a 'bearer' of access rights.
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

// Setup legacy HTTP link for queries and mutations.
const httpLink = new HttpLink({ uri: "http://localhost:4001" });

// Setup new WebSocket link for subscriptions.
const wsLink = new GraphQLWsLink(createClient({ url: "ws://localhost:4001" }));

// Create HTTP/WS split link using ApolloLink.split.
const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink, // Use WebSocket link for subscriptions
  authLink.concat(httpLink), // Useauthenticated HTTP for everything else (query/mutation).
);

const client = new ApolloClient({
  // Link Apollo Client to GraphQL server.
  cache: new InMemoryCache(), // Create session data cache (store query results). Cache is cleared if page refreshed.
  link: splitLink, // Set the combined link as the transport
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Offer the Apollo Client instance to all child components, so any component can access the server */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
