// src/App.jsx:
import { useState } from "react";
import { useApolloClient, useSubscription } from "@apollo/client/react"; // useApolloClient to clear cache on logout client.resetStore(). useSubscription to listen for updates from the server.
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Notify from "./components/Notify";
import LoginForm from "./components/LoginForm"; // Import the login form view.
import Recommend from "./components/Recommend"; // Support recommended books view (favourites).
import { BOOK_ADDED } from "./queries"; // Import the required subscription string defined in queries.js.

import { addNewBookToCache } from "./utils/apolloCache"; // Import helper function to update the cache with the newBook, from src/utils.

const App = () => {
  // Initialise page state, setting default (front) page as authors.
  const [page, setPage] = useState("authors");
  // Initialise error state
  const [errorMessage, setErrorMessage] = useState(null);
  // Initialise token state from localStorage using 'admin-user-token' key. localStorage: so, if a user refreshes the page, they remain logged in.
  const [token, setToken] = useState(localStorage.getItem("admin-user-token"));
  // Access the Apollo client instance so we can reset the store or manipulate the cache.
  const client = useApolloClient();

  // Helper to manage notification visibility and duration.
  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000); // Notification displayed for 10 seconds
  };

  // Subscription implementation. This hook sets up a WebSocket listener. It runs the 'onData' callback every time the backend publishes a 'BOOK_ADDED' event.
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      // data.data contains the result of the subscription defined in queries.js
      const addedBook = data.data.bookAdded;
      // Repurpose notify() function to show bookAdded message.
      notify(
        // Since we use the BookDetails fragment (which includes the author object) in our query, we can access addedBook.author.name.
        `New book added: "${addedBook.title}" by ${addedBook.author.name}`,
      );
      // addNewBookToCache() manually pushes the new data into the cache to trigger a UI update without requiring the user to refresh the page or the component to refetch.
      addNewBookToCache(client.cache, addedBook); // Use the client defined at the top of the component.
    },
  });

  // Logic to handle logging out, by cleaning up.
  const logout = () => {
    setToken(null); // Clear token from React state.
    localStorage.clear(); // Remove token from browser storage.

    // resetStore() clears the Apollo cache and also re-executes all active queries to ensure the UI immediately reflects the "logged out" state (hiding private data).
    client.resetStore();

    // Redirect to authors (front) page after logging out.
    setPage("authors");
  };

  return (
    <div>
      {/* Renders the error notification bar, if errorMessage is not null */}
      <Notify errorMessage={errorMessage} />

      <div>
        {/* These buttons are always visible to everyone */}
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>

        {/* Conditional Navigation UI: If no token exists (logged out), show the login' button.
            If valid token exist (logged in), show 'add book' and 'logout' buttons. */}
        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        )}
      </div>

      {/* Authors view: We pass the 'token' prop so Authors.jsx can 
          conditionally hide/show the "Set birthyear" form. */}
      <Authors show={page === "authors"} setError={notify} token={token} />

      <Books show={page === "books"} />

      {/* NewBook: Only accessible via the button hidden by the !token check above */}
      <NewBook show={page === "add"} setError={notify} />
      {/* Recomended component: listen for the 'recommend' page state and execute its internal useQuery(ME) and useQuery(ALL_BOOKS) hooks.*/}
      <Recommend show={page === "recommend"} />

      {/* LoginForm view: Passed the setters for token and page to handle successful login */}
      <LoginForm
        show={page === "login"}
        setToken={setToken}
        setError={notify}
        setPage={setPage}
      />
    </div>
  );
};

export default App;
