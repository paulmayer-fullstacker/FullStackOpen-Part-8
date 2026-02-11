// src/components/Books.jsx:
import { useQuery } from "@apollo/client/react"; // Import React specific useQuery hook from the Apollo library.
import { ALL_BOOKS } from "../queries"; // Import the predefined GraphQL query object from our queries file.
// Define functional component 'Books', accepting 'props' from the parent (App.jsx).
const Books = (props) => {
  // /* Initialize the GraphQL query, executing immediately on render. 'result' is an object containing properties: loading, error, and data.
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
  // Render Logic: If we reach this point, props.show is true and data is ready to be displayed.
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th>{/* Empty header for the book title column */}</th>
            <th>author</th>
            <th>published</th>
            <th>genres</th> {/* Table header for genres */}
          </tr>
          {/* Iterate (map) over the 'books' array. For every book object 'a', return a new table row (tr). */}
          {books.map(
            (
              a, // Key attribute required to identify table row. Use the unique 'book id' from the database to track this specific row. Using the key, React can just rerender a single row (that has changed) without rerendering the entire component.
            ) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                {/* author is now an object. So, to isolate he name we need a.author.name */}
                <td>{a.author.name}</td>
                <td>{a.published}</td>
                {/* Join contents of genre array items with ", ", into a single string for rendering */}
                <td>{a.genres.join(", ")}</td>{" "}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};
export default Books;
