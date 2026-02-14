// src/components/Authors.jsx:

import { useState } from "react"; // Used for editAuthor form component state.
import { useQuery, useMutation } from "@apollo/client/react"; // Import React specific useQuery and useMutation hooks from the Apollo library.
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"; // Import queries from the queries file

const Authors = (props) => {
  // Local state for the Set Birthyear form fields. Initially empty.
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  // Fetche the author data. result contains loading, error, and data states.
  const result = useQuery(ALL_AUTHORS);

  // The hook (useMutation) defines the mutation logic and communication with the server. The hook returns a function that we call updateBirthYear().
  // On form submission, updateBirthYear() is called. updateBirthYear() triggers the GraphQL mutation.
  const [updateBirthYear] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }], // Ensure the list updates after a change
    // Catching Database connectivity errors or data type mismatches.
    onError: (error) => {
      // Log the whole thing so we can finally see it if it exists
      console.log("DEBUG ERROR:", error);

      const errorDetails =
        error.graphQLErrors?.length > 0
          ? error.graphQLErrors[0].extensions?.error
          : error.message;
      // Use the prop passed from App.jsx to show the notification.
      props.setError(errorDetails || "An unknown error occurred");
      //   // Look for the specific Mongoose error details we sent from the backend
      //   const errorDetails = error.graphQLErrors[0]?.extensions?.error;
      //   // Construct the professional display message
      //   const errorMessage = errorDetails
      //     ? `Update Failed: ${errorDetails}`
      //     : "Editing author failed. Please check your connection.";

      //   // Use the prop passed from App.jsx to show the notification
      //   props.setError(errorMessage);
      //   // Pass the error message back to App.jsx via the setError prop
      //   // props.setError(error.message)
      //   // Log for developer debugging
      //   console.log(error.graphQLErrors[0]?.message || error.message);
    },
  });
  // Conditional rendering: if this page isn't active, show nothing.
  if (!props.show) {
    return null;
  }

  // Decentralise handling of the loading state. Only the specific table (Authors) shows a loading indicator. The User can still see/use other components.
  if (result.loading) {
    return <div>loading...</div>;
  }

  // Query error handling (Fetch Safety Net) for the author list.
  if (result.error) {
    // If the server is down or the query is malformed, result.error becomes an object. Display the error message to the user.
    return <div>Error: {result.error.message}</div>;
  }

  // Extract the data from the result object
  const authors = result.data.allAuthors;

  // Safely extract data ONLY after loading and error checks pass
  // const authors = result.data ? result.data.allAuthors : [];

  const submit = async (event) => {
    event.preventDefault();

    // Frontend Validation. Prevent sending an empty string/NaN to the server. Satisfy the "Int!" requirement in queries.js and avoids a 400 error.
    if (!born || born.trim() === "") {
      props.setError("Please provide a valid birthyear");
      return;
    }

    // Trigger the GraphQL mutation.
    updateBirthYear({
      variables: { name, setBornTo: parseInt(born) },
    });
    // Clear form fields after submission.
    setName("");
    setBorn("");
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Conditional UI rendering: 'Set birthyear' form only rendered if a 'token' prop exists. Thus, only logged-in user can edit authors. */}
      {props.token && (
        <>
          {/* Set Birthyear form with dropdown Author selector */}
          <h3>Set birthyear</h3>
          <form onSubmit={submit}>
            <div>
              name
              {/* Dropdown selector: removes potential for erronius input. */}
              <select
                value={name}
                onChange={({ target }) => setName(target.value)}
              >
                <option value="" disabled>
                  select author...
                </option>
                {authors.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              born
              <input
                type="number"
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        </>
      )}
    </div>
  );
};
export default Authors;
