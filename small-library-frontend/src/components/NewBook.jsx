// src/components/NewBook.jsx:
import { useState } from "react"; // Used for new book form component state.
import { useMutation } from "@apollo/client/react"; // Import React specific useMutation hook from the Apollo library.
import { CREATE_BOOK, ALL_BOOKS, ALL_AUTHORS } from "../queries"; // Import the mutation, and the queries needed to refresh after adding a book

const NewBook = (props) => {
  // Local state for the add Book form fields. Initially empty.
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState(""); // genre to be input from text field with [add genre] submit button.
  const [genres, setGenres] = useState([]); // array of genres, built by concatinating each additional genre to the end of the array.

  // Initialize the mutation hook
  const [addBook] = useMutation(CREATE_BOOK, {
    // Ensure that Authors and Books views are updated, by rerunning these queries when a newBook is added.
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
    onError: (error) => {
      // Error handling in case of server comms failure (i.e., validation failure).
      console.log(error.graphQLErrors[0]?.message || error.message);
    },
  });
  // Guard Clause Conditional rendering: if props.show===true, the add book button has been activated. If not Do Nothing
  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault(); // Prevent the browser from reloading the page

    console.log("add book...");

    // addBook() function triggers the CREATE_BOOK mutation using the variables collected from our state.
    addBook({
      variables: {
        title,
        author,
        published: parseInt(published), // Any value derived from <input /> is stored as a string in JS. parsInt converts to a number before sending to the server.
        genres, // Array built by the addGenre function.
      },
    });
    // Clear state and input fields after newBook created.
    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };
  // Arrow function addGenre prepares the genres array in readyness for the addBook function.
  const addGenre = () => {
    // Update 'genres' array state, by taking the current list (genres) and creating a new array by attaching the string from the input field (genre) to the end.
    setGenres(genres.concat(genre));
    // Clears the single genre input field. Empty the text box, so the user can type another genre.
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)} // Update state on every keystroke
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>{" "}
        {/* Display the genres added so far by joining the array with spaces */}
        <button type="submit">create book</button>
      </form>
    </div>
  );
};
export default NewBook;
