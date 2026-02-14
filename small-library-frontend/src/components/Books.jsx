// src/components/Books.jsx:
import { useState } from "react"; // Used to managethe state of the books view when filtered by genre.
import { useQuery } from "@apollo/client/react"; // Import React specific useQuery hook from the Apollo library.
import { ALL_BOOKS } from "../queries"; // Import the predefined GraphQL query object from our queries file.
// Define functional component 'Books', accepting 'props' from the parent (App.jsx).
const Books = (props) => {
  // Initialise state for the genre filter.
  const [genreFilter, setGenreFilter] = useState("all genres");
  // Initialise the GraphQL query, executing immediately on render. 'result' is an object containing properties: loading, error, and data.
  const result = useQuery(ALL_BOOKS);
  // Conditional Rendering - Guard Clause: 'props.show' (boolean) is passed from App.jsx (page === "books"). If it is false, enter this block.
  if (!props.show) {
    // Returning 'null' tells React not to render this component.
    return null;
  }

  // Decentralise handling of the loading state. Only the specific table (Authors) shows a loading indicator. The User can still see/use other components.
  if (result.loading) {
    // While the HTTP request to the GraphQL server is in progress, result.loading is true. So, show 'loading ...' to the user (could be a time elapse widget spinner).
    return <div>loading...</div>;
  }

  // Query error handling (Fetch Safety Net):
  if (result.error) {
    // If the server is down or the query is malformed, result.error becomes an object. Display the error message to the user.
    return <div>Error: {result.error.message}</div>;
  }
  // Once loading is false and there is no error, we can extract the array of book objects from the result.data object.
  const books = result.data.allBooks;

  // Extract all unique genres from the books array to create genre buttons. flatMap converts an array of arrays into a single flat array,
  // thus getting all genres into a sinle array. Converting this to a Set, remove duplicates.
  const allGenres = [...new Set(books.flatMap((b) => b.genres))];

  // Filter books based on the current state
  const booksFilteredByGenre =
    genreFilter === "all genres"
      ? books
      : books.filter((b) => b.genres.includes(genreFilter));

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
          {booksFilteredByGenre.map(
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
