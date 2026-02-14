// // src/components/LoginForm.jsx:
import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react"; // Import React specific useMutation hook from the Apollo library.
import { LOGIN } from "../queries"; // Import the login query.
// LoginForm with props deconstructed
const LoginForm = ({ show, setError, setToken, setPage }) => {
  // Local state to capture the text inputs for username and password.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // useMutation hook. 'login': the function called to execute the mutation. 'result': response data (inc. token) from the server once mutation completes.
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      // Log full error to the console for debugging
      console.log("DEBUG ERROR:", error);
      // if specific error details from extensions, use them, else just use the top-level message.
      const errorDetails =
        error.graphQLErrors?.length > 0
          ? error.graphQLErrors[0].extensions?.error
          : error.message;
      // If login fails (i.e.: wrong password), use setError prop passed from App.jsx to show a notification to the user.
      setError(errorDetails || "An unknown error occurred");
    },
  });

  // useEffect runs after the component renders, to handle the response when the login is successful. // useEffect runs after the component renders.
  // We monitor 'result.data' to see if the login mutation has finished successfully.
  useEffect(() => {
    // if 'result.data', the login mutation has finished successfully.
    if (result.data) {
      // The server returns the token inside an object: { login: { value: "..." } }
      const token = result.data.login.value;
      setToken(token); // Update the token state in App.jsx via the setToken prop.
      localStorage.setItem("admin-user-token", token); // Persist token in the browser's localStorage. Thus user remains logged in post page refresh.
      setPage("authors"); // Redirect to home (authors) page after login.
    }
  }, [result.data]); // eslint-disable-line
  // This effect (useEffect), only triggers when result.data changes.

  // Guard Clause: If the 'show' prop is false, do not render this page.
  if (!show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault(); // Prevent the default HTML form submission (page reload).
    login({ variables: { username, password } }); // Call the mutation function with the variables as typed into the form

    // Reset input fields
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          name{" "}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{" "}
          <input
            type="password" // Hides characters as they are typed.
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
