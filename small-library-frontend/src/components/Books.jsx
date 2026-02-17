// src/components/Books.jsx:
import { useState, useEffect } from "react"; // useState manages state of the books view when filtered by genre. useEffect handles refetch logic for the genre buttons.
import { useQuery } from "@apollo/client/react"; // Import React specific useQuery hook from the Apollo library.
import { ALL_BOOKS } from "../queries"; // Import the predefined GraphQL query object from our queries file.
// Define functional component 'Books', accepting 'props' from the parent (App.jsx).
const Books = (props) => {
  // Initialise state for the genre filter.
  const [genreFilter, setGenreFilter] = useState("all genres");
  // Fetch filtered book list (filter by args variable). Query re-runs every time genreFilter changes. Used to populate the table of books.
  const filteredBookList = useQuery(ALL_BOOKS, {
    // Argument variables: If genreFilter is 'all genres', send null so the backend returns everything. Else send the genreFilter
    variables: { genre: genreFilter === "all genres" ? null : genreFilter },
  });
  // Fetch unfiltered book list. Query runs once (or pulls from cache), when the component is mounted. Used to extract the full list of unique genres for the genre buttons.
  const unfilteredBooksList = useQuery(ALL_BOOKS);

  // This useEffect ensures the filtered list is updated from the server, not lcal cache. Whenever a genre button is clicked, it calls the refetch method belonging to the filteredBookList query.
  useEffect(() => {
    if (props.show) {
      // Only trigger the refetch when rendering the Books page, to save unnecessary network traffic, if user goes to the Authors page.
      filteredBookList.refetch(); // refetch() ignores local cache, sending a new request to the GraphQL server to get the latest data.
    }
  }, [genreFilter, filteredBookList, props.show]); // Dependency array. Whenever genreFilter, filteredBookList, or props.show change, filteredBookList.refetch() is triggered.

  // Conditional Rendering - Guard Clause: 'props.show' (boolean) is passed from App.jsx (page === "books"). If it is false, enter this block.
  if (!props.show) {
    // Returning 'null' tells React not to render this component.
    return null;
  }

  // Loading state: Both queries (filtered/unfiltered) must have completed and returned. If not: ... loading... .
  if (filteredBookList.loading || unfilteredBooksList.loading) {
    // While the HTTP request to the GraphQL server is in progress, filteredBookList.loading or unfilteredBooksList.loading will be true. So, show 'loading ...' to the user (could be a time elapse widget spinner).
    return <div>loading...</div>;
  }

  // Query error handling (Fetch Safety Net), for filtered list.
  if (filteredBookList.error) {
    // If the server is down or the query is malformed, filteredBookList.error becomes an object. Display the error message to the user.
    return <div>Error: {filteredBookList.error.message}</div>;
  }
  // Once loading is false and there is no error, we can extract the array of filtered book objects from the result.data object.
  const filteredBooks = filteredBookList.data.allBooks;

  // Extract all unique genres from the books array to create genre buttons. flatMap converts an array of arrays into a single flat array,
  // thus getting all genres into a sinle array. Converting this to a 'new' Set, remove duplicates.
  const allGenres = [
    // The spread operator [...] takes the individual items from the set and places them into an array created by the delimiting square brackets [].
    ...new Set(unfilteredBooksList.data.allBooks.flatMap((b) => b.genres)),
  ];

  // Render Logic: If we reach this point, props.show is true and data is ready to be displayed.
  return (
    <div>
      <h2>books</h2>
      {/* Display current filter if one is active */}
      {genreFilter !== "all genres" && (
        <p>
          in genre <strong>{genreFilter}</strong>
        </p>
      )}
      <table>
        <tbody>
          <tr>
            <th>{/* Empty header for the book title column */}</th>
            <th>author</th>
            <th>published</th>
            <th>genres</th>
          </tr>
          {/* Iterate (map) over the 'books' array. For every book object 'a', return a new table row (tr). */}
          {filteredBooks.map(
            (
              a, // Key attribute required to identify table row. Use the unique 'book id' from the database to track this specific row. Using the key, React can just rerender a single row (that has changed) without rerendering the entire component.
            ) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                {/* author is now an object. So, to isolate he name we need a.author.name */}
                <td>{a.author.name}</td>
                <td>{a.published}</td>
                {/* Join contents of genre array items with ", ", into a single string for rendering */}
                <td>{a.genres.join(", ")}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
      {/* Render genre buttons */}
      <div style={{ marginTop: "20px" }}>
        {allGenres.map((g) => (
          <button key={g} onClick={() => setGenreFilter(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenreFilter("all genres")}>all genres</button>
      </div>
    </div>
  );
};
export default Books;
