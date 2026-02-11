// src/main.jsx:
import { StrictMode } from "react"; // Import StrictMode component: help identify common bugs during development.
import { createRoot } from "react-dom/client"; // Import createRoot: API for rendering a React app into the HTML DOM.
import App from "./App.jsx"; // Import our main application component from App.jsx.

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"; // Import core Apollo tools: the client, HTTP connection, and a local caching.
import { ApolloProvider } from "@apollo/client/react"; // Import ApolloProvider component. Used to make the Apollo Client available to the rest of the app.

const client = new ApolloClient({
  // Link Apollo Client to GraphQL server.
  link: new HttpLink({
    uri: "http://localhost:4001",
  }),
  // InMemoryCache: Local storage where Apollo saves query results, thus reducing network traffic.
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Offer the Apollo Client instance to all child components, so any component can access the server */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
