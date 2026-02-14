// src/components/Notify.jsx:
// Define functional component 'Notify' that receives 'errorMessage' as a prop via destructuring.
const Notify = ({ errorMessage }) => {
  // Guard Clause:
  if (!errorMessage) {
    // if 'errorMessage' is null, undefined, or an empty string, the component returns null (component renders nothing to the DOM).
    return null;
  }
  // else: return a <div> containing the errorMessage. The 'style' prop uses an object to apply inline CSS, making the text red.
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};
// Export the component so it can be imported and used in our views.
export default Notify;
