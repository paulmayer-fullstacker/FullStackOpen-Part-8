// src/main.jsx:
import { StrictMode } from "react"; // Import StrictMode component: help identify common bugs during development.
import { createRoot } from "react-dom/client"; // Import createRoot: API for rendering a React app into the HTML DOM.
import App from "./App.jsx"; // Import our main application component from App.jsx.
// Import Apollo Client and links
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"; // Import core Apollo tools: the client, HTTP connection, and a local caching.
import { ApolloProvider } from "@apollo/client/react"; // Import ApolloProvider component. Used to make the Apollo Client available to the rest of the app.
// Request interceptor: Automatically modify the metadata (context) of a GraphQL request (the HTTP Headers), just before the browser sends it to the server.
import { SetContextLink } from "@apollo/client/link/context";

//
const authLink = new SetContextLink(({ headers }) => {
  //
  const token = localStorage.getItem("admin-user-token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const httpLink = new HttpLink({ uri: "http://localhost:4001" });

const client = new ApolloClient({
  // Link Apollo Client to GraphQL server.
  cache: new InMemoryCache(), // Create session data cache (store query results). Cache is cleared if page refreshed.
  link: authLink.concat(httpLink), // Chain the authLink and httpLink. authLink adds the header, then httpLink handles network delivery.
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Offer the Apollo Client instance to all child components, so any component can access the server */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
