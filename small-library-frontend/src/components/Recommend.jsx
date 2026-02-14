// src/components/Recommend.jsx:
import { useQuery } from "@apollo/client/react"; // Import useQuery hook, allowing React to communicate with the Apollo Provider.
import { ALL_BOOKS, ME } from "../queries"; // Import specific GraphQL query definitions needed for this view.

const Recommend = (props) => {
  // Execute 'me' query immediately, fetching the logged-in user's profile information. currentUser will contain 'loading', 'error', and 'data' states.
  const currentUser = useQuery(ME);

  // Extract user's favouriteGenre from the query data using optional chaining (?.). Value will be 'undefined' while the query is loading or if the user is not found.
  const favouriteGenre = currentUser.data?.me?.favouriteGenre;
  // Execute the 'allBooks' query passing the user's favouriteGenre as a GraphQL variable.
  const favouriteBooks = useQuery(ALL_BOOKS, {
    variables: { genre: favouriteGenre }, // Variables: By sending a parameterised query to the backend. GraphQL server uses it in its database query, only returning books of the corresponding genre.
    skip: !favouriteGenre, // The 'skip' option prevents this query from running automatically. It stays 'skipped' (true) until favouriteGenre has a value from the earlier query.
  });
  // Guard Clause: If the parent (App.jsx) is not currently showing this page, do n continue processing or render.
  if (!props.show) return null;
  // Loading State Handler: Show 'loading...' if still fetching the user profile, or if genre present but still fetching the filtered book list.
  if (currentUser.loading || (favouriteGenre && favouriteBooks.loading)) {
    return <div>loading...</div>;
  }

  // Authentication Validation:
  if (!currentUser.data?.me) {
    // If the query finished but no user was found in context: authentication failed
    return (
      <div>
        <h2>recommendations</h2>
        <p>Error: Could not fetch user profile. Are you logged in?</p>
      </div>
    );
  }

  // Database Data Validation:
  if (!favouriteGenre) {
    // If user exists but their favouriteGenre is not in the Db:
    return (
      <div>
        <h2>recommendations</h2>
        <p>
          Welcome <strong>{currentUser.data.me.username}</strong>. You haven't
          set a favourite genre yet!
        </p>
      </div>
    );
  }
  // Extract the array of books from the result of the useQuery(ALL_BOOKS query. If no data exists, default to empty array ([]) to prevent .map() errors.
  const books = favouriteBooks.data?.allBooks || [];
  // User and genre have been validated. Render full page. I see the repetition here, but the validation was initially implemented to help debugging.
  return (
    <div>
      <h2>recommendations</h2>
      <p>
        {/* Display the context of the recommendations based on the user's preference */}
        books in your favourite genre <strong>{favouriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {/* Loop through the genre filtered book array and render a row for each */}
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
// Export component for use in App.jsx
export default Recommend;
