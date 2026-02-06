// src/App.jsx:
import { useState } from "react"; // Import the useState Hook: used to track which page is active.
import Authors from "./components/Authors"; // Import components. Each of these components will have its own page (view).
import Books from "./components/Books";
import NewBook from "./components/NewBook";

const App = () => {
  // Set the default (opening) page to Authors, when the app opens.
  const [page, setPage] = useState("authors");

  return (
    <div>
      <div>
        {/* Set the page view per the button selection */}
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
      </div>
      {/* show used in Authors.jsx for conditional rendering. If page is authors (default) Authors show===true*/}
      <Authors show={page === "authors"} />
      {/* show used in Books.jsx for conditional rendering. If books button selected, page becomes books and Books show===true */}
      <Books show={page === "books"} />
      {/* If add book buttonselected, NewBook show now becomes true */}
      <NewBook show={page === "add"} />
    </div>
  );
};
/* 
Note on Page State, Selection and Render:
When user clicks the [add book] button, setPage("add") is trigered. Thus, the value of page changes globally for that render cycle. 
React then re-evaluates all three components. Page can only be in ONE state (author, books or add). 
So, Authors component's show prop automatically flips to false the instant the NewBook component's prop flips to true.
*/
export default App;
