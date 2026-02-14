// schema.js:
// GraphQL Schema: Defines the public API (Type Definitions).
// TypeDefinitions. Builtin Types: Int, String, Float, Boolean, ID.
const typeDefs = /* GraphQL */ `
  type User {
    username: String!
    favouriteGenre: String! # Field name changed from task brief. Was favorite.
    id: ID!
  }

  type Token {
    value: String!
  }
  type Author {
    name: String! # Required (!).
    born: Int # Nullable.
    bookCount: Int! # Derived field (calculated via resolver).
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    # author: String! # Case we only want the author name and no ther information.
    author: Author! # Schema designed with author as Author type. So we can retrieve author born and id from the book (Note-1).
    id: ID!
    genres: [String!]! # A required array containing required strings.
  }

  type Query {
    bookCount: Int! # Return the number of books.
    authorCount: Int! # Return number of authors.
    allAuthors: [Author!]! # Return array of all authors. Authors: not null. Array: not null (!).
    # allBooks(author: String): [Book!]! # All (optional: books by author) books.
    allBooks(author: String, genre: String): [Book!]!
    me: User # Returnes the logged-in user
  }

  type Mutation {
    # Mutation to creates a new user, inc. their favourite genres.
    createUser(username: String!, favouriteGenre: String!): User

    # Mutation to log in as user, and so receive a valid token.
    login(username: String!, password: String!): Token

    # Mutation to add a new book, and perhaps a new author (if author does not exist).
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
module.exports = typeDefs;
