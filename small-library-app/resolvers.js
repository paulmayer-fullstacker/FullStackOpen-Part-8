// resolvers.js:
// Resolvers: Defines the logic for the public API to fulfill requests.
const { GraphQLError } = require("graphql"); // Import GraphQLError class. Used to send specific error codes (like BAD_USER_INPUT) to the client.
const jwt = require("jsonwebtoken"); // Import jsonwebtoken to handle the creation (signing) of JWT authentication tokens.

// Import the Mongoose models to interact with the MongoDB collections.
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const JWT_SECRET = process.env.JWT_SECRET || "HARD_CODED_JWT_SECRET"; // Use this secret for signing tokens. From .env, else hard coded,

// Resolvers: define how data is fetched for each field in the schema.
const resolvers = {
  Query: {
    // Mongoose counts documents directly from the database. This improves performance, over fetching all records and processing.
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {
      let query = {};

      if (args.author) {
        // if arg author is provided, since author is currently a String in the DB, query it directly.
        query.author = args.author;
      }

      if (args.genre) {
        query.genres = { $in: [args.genre] }; // if arg genres is provided (genres is an array), Mongoose $in checks if value is in the array.
      }

      return Book.find(query); // Perform the database search with the newly built query (or empty query {} if no args were provided)
    },
    // Fetche every document from the authors collection. Required to populate the initial Authors view.
    allAuthors: async () => Author.find({}),

    // me query returns the current user from the context.
    me: (root, args, context) => {
      // If the server context function found a user, return. Else, if no token was provided or invalid, context.currentUser will be undefined.
      return context.currentUser;
    },
  },

  // Field Resolver: Each time Apollo deals with Book object, process the author field like this:
  Book: {
    author: async (root) => {
      // root.author contains the string name stored in the Book document. Use that to find the actual Author document.
      return Author.findOne({ name: root.author });
    },
  },
  // Field Resolver: Each time Apollo deals with Author object, process the bookCount field like this:
  Author: {
    // Field resolver required, because 'bookCount' is not a field in the Author DB model.
    bookCount: async (root) => {
      // 'root.name' is the name of the author we are currently processing.
      return Book.countDocuments({ author: root.name });
    },
  },

  Mutation: {
    // Implementation for creating a new user document in the database
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre, // Argument property favorite changed from task brief.
      });
      // Attempt to save and catch Mongoose validation errors (like non-unique username).
      return user.save().catch((error) => {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    // Logic for verifying credentials and issuing a JWT to the user.
    login: async (root, args) => {
      // Log in user.
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        // if user not exists or password not 'secret', throw error.
        throw new GraphQLError("incorrect credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      // User information to be encoded into the token.
      const logedInUser = {
        username: user.username,
        id: user._id,
      };
      // Return signed token (signed with user info and our secret). Returned as 'Token' type defined in the schema.
      return { value: jwt.sign(logedInUser, JWT_SECRET) };
    },
    // Logic for adding a book. Authorisation required. So, this is checked.
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      // Authorisation check: Ensure the request contains a valid user identity.
      if (!currentUser) {
        // If context.currentUser is null, the token was missing, invalid, or expired.
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      // Check if the author mentioned in args already exists in the Db.
      const authorExists = await Author.findOne({ name: args.author });

      try {
        if (!authorExists) {
          // If author does not exist in the Db, create them as a side-effect of adding the book.
          const newAuthor = new Author({ name: args.author });
          await newAuthor.save(); // Side-effect: auto-create author if author does not exist.
        }

        // Create the new book using all arguments (title, published, genres, author). author is the string from args.author.
        const book = new Book({ ...args });

        return await book.save();
      } catch (error) {
        // Map the Mongoose error to a GraphQLError. Thus, Graph can pass meaningfull error message to the fontend.
        throw new GraphQLError(error.message, {
          // Use the Mongoose message as the primary string.
          extensions: {
            code: "BAD_USER_INPUT",
            // message: 'Adding book failed', // Our message.
            invalidArgs: args.title || args.name,
            error: String(error.message), // Wrap raw Mongoose error object as a String.
          },
        });
      }
    },
    // Logic for updating an author's birth year.
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;

      // Authorisation check: Ensure the user is logged in before allowing edits (request contains a valid user identity).
      if (!currentUser) {
        // If context.currentUser is null, the token was missing, invalid, or expired.
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const author = await Author.findOne({ name: args.name });
      // If the author name not found, return null (per our schema).
      if (!author) return null;
      // Update the Mongoose document property.
      author.born = args.setBornTo;

      // Wrap in try/catch to handle validation errors during update.
      try {
        return await author.save(); // Persist the change to MongoDB
      } catch (error) {
        // Inform GraphQL client exactly what kind of error it is (validation/input error).
        throw new GraphQLError(error.message, {
          // Use the Mongoose message as the primary string.
          extensions: {
            code: "BAD_USER_INPUT",
            // message: 'Adding book failed', // Our message.
            invalidArgs: args.title || args.name,
            error: String(error.message), // Wrap raw Mongoose error object as a String.
          },
        });
      }
    },
  },
};

module.exports = resolvers;
