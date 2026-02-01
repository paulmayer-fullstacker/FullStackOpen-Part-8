const { ApolloServer } = require("@apollo/server"); // Import core Apollo Server class for creating the server instance.
const { startStandaloneServer } = require("@apollo/server/standalone"); // Import helper function to start the server as a standalone Node.js process.
const { v4: uuid } = require("uuid"); // Allows us to generate unique Iid in our resolver.
// Simulated Db. authors: array of objects.
let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    // born: nullable
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];
/*
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 */
// Simulated Db. books: array of objects.
let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin", // author stored as a String, NOT an Author object.
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"], // genres: array of Strings. Not an array of genre enumes or objects.
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];
// GraphQL Schema. Net Ninja recommends placing this in its own schema.js file.
// TypeDefinitions. Builtin Types: Int, String, Float, Boolean, ID.
const typeDefs = /* GraphQL */ `
  type Author {
    name: String! # Required (!).
    born: Int # Nullable.
    bookCount: Int! # Derived field (calculated via resolver).
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: String! # Case we only want the author name and no ther information.
    # author: Author! # Schema designed with author as Author type. So we can retrieve author born and id from the book (Note-1).
    id: ID!
    genres: [String!]! # A required array containing required strings.
  }

  type Query {
    bookCount: Int! # Return the number of books.
    authorCount: Int! # Return number of authors.
    allAuthors: [Author!]! # Return array of all authors. Authors: not null. Array: not null (!).
    # allBooks(author: String): [Book!]! # All (optional: books by author) books.
    allBooks(author: String, genre: String): [Book!]!
  }

  type Mutation {
    # Mutation to add a new book,  and perhaps a new author (if author does not exist).
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    # Mutation to update an existing author's birth year
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;
// Resolvers: define how data is fetched for each field in the schema.
const resolvers = {
  Query: {
    // Return the current length of the books array, and authors array.
    bookCount: () => books.length,
    authorCount: () => authors.length,
    // allBooks: (root, args) => {
    //   // If no author argument is provided, return all books
    //   if (!args.author || !args.genre) {
    //     return books;
    //   }
    //   // If an author argument exists, filter the list
    //   if (args.author) {
    //     return books.filter((b) => b.author === args.author);
    //   }
    //   if (args.genres) {
    //     return books.filter((b) => b.genres === args.genres);
    //   }
    // },
    allBooks: (root, args) => {
      // Accepts authors or genres or both (i.e., allBooks(author: "Robert Martin", genre: "refactoring")).
      let filteredBooks = books; // Must reassign befoe processing. Must not filter a global variable.

      if (args.author) {
        // If 'author' argument is provided, filter the array by name
        filteredBooks = filteredBooks.filter((b) => b.author === args.author);
      }

      if (args.genre) {
        // If 'genre' argument is provided, filter the books array by what is in the genre array. Books array may have already been filtered by author name.
        // Use .includes() as genres is an array in our book objects.
        filteredBooks = filteredBooks.filter((b) =>
          b.genres.includes(args.genre),
        );
      }
      return filteredBooks;
    },
    // Simple return of the entire authors array.
    allAuthors: () => authors,
  },
  // Field Resolver: Each time Apollo deals with a Book object, deal with the author field in this way.
  //   Book: {
  //     // root: the "parent" object. In this case, the specific book Apollo is currently dealing with.
  //     author: (root) => {
  //       return authors.find((a) => a.name === root.author); // Return the author object with the same name as the book author
  //     },
  //   },

  // Field Resolver: Each time Apollo deals with Author object, process the bookCount field like this:
  Author: {
    bookCount: (root) => {
      // 'root' is the author object currently being processed
      return books.filter((b) => b.author === root.name).length; // Filter the books array to find how many books match this author's name.
    },
  },

  Mutation: {
    addBook: (root, args) => {
      // Assign, if author already present in the list.
      const authorPresent = authors.find((a) => a.name === args.author);

      if (!authorPresent) {
        // If author NOT present, add to the authors array.
        const newAuthor = {
          name: args.author,
          id: uuid(), // Inc a unique id.
        }; // Use concat to maintain a new array reference. Treating data as imutable.
        authors = authors.concat(newAuthor);
      }

      // Create the new book object, either with the newly created author or an author already present in the list.
      const newBook = { ...args, id: uuid() }; // Spreading args and add a unique id to create the new Book object.
      books = books.concat(newBook); // Add the new Book to the list of books.

      return newBook; // Verify new Book and improve client-side effiviency.
      // 1. We are noy just echoing back what the user sent, but are returning the object as it now exists on the server.
      // 2. Frontend can automatically update its local cache without needing to refetch the entire list of books from the server.
    },

    editAuthor: (root, args) => {
      // Find the author in our local authors array
      const author = authors.find((a) => a.name === args.name);

      if (!author) {
        // If author doesnot exits, do nothing.
        return null;
      }
      // Update the author object
      const editedAuthor = { ...author, born: args.setBornTo };
      // .map() creates a new array with the updated Author object. Treat global data as immutable - Best practice to avoid spuriouse bugs.
      authors = authors.map((a) => (a.name === args.name ? editedAuthor : a));

      return editedAuthor; // Confirm edited Author is now on the server, update loacl cache.
    },
  },
};
// Initialize the Apollo Server with our definitions and logic.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
// Start the server and log the URL once it's listening.
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`); // Remind me where to find the server.
});
