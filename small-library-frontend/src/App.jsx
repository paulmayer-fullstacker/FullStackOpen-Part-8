// src/App.jsx:
import { useState } from "react";
import { useApolloClient } from "@apollo/client/react"; // Used to clear the cache on logout. client.resetStore()
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Notify from "./components/Notify";
import LoginForm from "./components/LoginForm"; // Import the login form view.
import Recommend from "./components/Recommend"; // Support recommended books view (favourites).

const App = () => {
  // Initialise page state, setting default (front) page as authors.
  const [page, setPage] = useState("authors");
  // Initialise error state
  const [errorMessage, setErrorMessage] = useState(null);

  // Initialise token state from localStorage using 'admin-user-token' key. localStorage: so, if a user refreshes the page, they remain logged in.
  const [token, setToken] = useState(localStorage.getItem("admin-user-token"));

  // Access the Apollo client instance so we can reset the store.
  const client = useApolloClient();
  // Helper to manage notification visibility and duration.
  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000); // Notification displayed for 10 seconds
  };

  // Logic to handle logging out, by cleaning up.
  const logout = () => {
    setToken(null); // Clear token from React state.
    localStorage.clear(); // Remove token from browser storage.

    // resetStore() clears the Apollo cache. Security: data from one user is not visible to the next user of the browser.
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
