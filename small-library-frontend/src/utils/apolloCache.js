// src/utils/apolloCache.js:
import { ALL_BOOKS } from "../queries"; // Import the required subscription string defined in queries.js.

// Helper function to update the Apollo cache when a new book is added.
export const addNewBookToCache = (cache, bookToAdd) => {
  // Reusable logic to update the Apollo cache, avoiding duplication.
  const updateCache = ({ allBooks }) => {
    // Check if the book already exists in the cache to avoid duplicates.
    const bookExists = allBooks.some((book) => book.id === bookToAdd.id);
    // If the book already exists, just return the original data object (list of books).
    if (bookExists) return { allBooks };
    // Else, return the updated list, with the new book added.
    return {
      allBooks: allBooks.concat(bookToAdd),
    };
  };

  // Update the query version used for genre buttons (no variables)
  cache.updateQuery({ query: ALL_BOOKS }, updateCache);

  // Update the query version used for the table of books (with { genre: null } variable)
  cache.updateQuery(
    { query: ALL_BOOKS, variables: { genre: null } },
    updateCache,
  );
};
