// resolvers.js:
// Resolvers: Defines the logic for the public API to fulfill requests.
const { GraphQLError } = require("graphql"); // Import GraphQLError class. Used to send specific error codes (like BAD_USER_INPUT) to the client.
const jwt = require("jsonwebtoken"); // Import jsonwebtoken to handle the creation (signing) of JWT authentication tokens.

const { PubSub } = require("graphql-subscriptions"); // Import PubSub to enable the "Publish/Subscribe" mechanism.
const pubsub = new PubSub(); // Create instance of PubSub to manage our event bus.

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

    allBooks: async (parent, args) => {
      let mongoQuery = {}; // mongoQuery is a Mongoose filter object.

      if (args.author) {
        // Book.author is now an ObjectId in the DB. So, first find the author document to get author's ID for the query.
        const authorDocument = await Author.findOne({ name: args.author });
        // If author not found, return an empty array because no books can belong to a non-existent author.
        if (!authorDocument) {
          return [];
        }
        mongoQuery.author = authorDocument._id;
      }

      if (args.genre) {
        mongoQuery.genres = { $in: [args.genre] }; // if arg genres is provided (genres is an array), Mongoose $in checks if value is in the array.
      }

      // n+1 resolution: .populate("author") fetches the full author object for every book in a single Db query, instead of fetching them one by one.
      return Book.find(mongoQuery).populate("author");
    },

    // Fetche every document from the authors collection. Required to populate the initial Authors view.
    allAuthors: async () => {
      // n+1 resolution: .populate("books") fetches all books associated with each author in the initial query.
      // This allows the Author.bookCount resolver to work without querying the Db again.
      return Author.find({}).populate("books");
    },
    // Who am I? Returns the current logged-in user's details (username, favouriteGenre, etc.), or 'null' if not logged in.
    me: (queryParent, args, context) => context.currentUser,
  },
  /* REMOVED. Examples of n+1 problem
  // Field Resolver: Each time Apollo deals with Book object, process the author field like this:
  // Book: {
  //   author: async (root) => {
  //     return Author.findOne({ name: root.author }); // n+1 problem. This runs once for every book returned by allBooks
  //   },
  // },
  // Field Resolver: Each time Apollo deals with Author object, process the bookCount field like this:
  // Author: {
  //   bookCount: async (root) => {
  //     return Book.countDocuments({ author: root.name }); // n+1 problem. This runs once for every author returned by allAuthors
  //   },
  // },
  */

  Author: {
    // n+1 resolution: Use the 'books' array already fetched by .populate('books').
    // bookCount: (root) => root.books.length,
    bookCount: (authorObject) => {
      // Log added for debugging and testing. This should print once for each author.
      console.log("N+1 Check: Resolving bookCount for:", authorObject.name);

      return authorObject.books.length;
    },
  },

  Mutation: {
    // Implementation for creating a new user document in the database
    createUser: async (createUserParent, args) => {
      const newUser = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre, // Argument property favorite changed from task brief.
      });
      // Attempt to save and catch Mongoose validation errors (like non-unique username).
      return newUser.save().catch((error) => {
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
    login: async (loginParent, args) => {
      // Log in user.
      const userRecord = await User.findOne({ username: args.username });

      if (!userRecord || args.password !== "secret") {
        // if userRecord not exists or password not 'secret', throw error.
        throw new GraphQLError("incorrect credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      // User information to be encoded into the token.
      const userTokenPayload = {
        username: userRecord.username,
        id: userRecord._id,
      };
      // Return signed token (signed with user info and our secret). Returned as 'Token' type defined in the schema.
      return { value: jwt.sign(userTokenPayload, JWT_SECRET) };
    },
    // Logic for adding a book. Authorisation required. So, this is checked.
    addBook: async (addBookParent, args, context) => {
      const authenticatedUser = context.currentUser;
      // Authorisation check: Ensure the request contains a valid user identity.
      if (!authenticatedUser) {
        // If context.currentUser is null, the token was missing, invalid, or expired.
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      // Find author to get their ObjectId
      let authorDoc = await Author.findOne({ name: args.author });
      // Ensure that if the addBook fails validation, a new author is NOT created
      // let isNewAuthor = false;

      // If author doesn't exist, create a local instance, but do not save to Db yet. This fixes bug where orphaned authors were created.
      if (!authorDoc) {
        authorDoc = new Author({ name: args.author });
        // isNewAuthor = true;
      }

      // Create the book instance using the author's ID (which Mongoose generates immediately)
      const book = new Book({ ...args, author: authorDoc._id });

      try {
        // Trigger validation manually on both book and author. Check minlength, required fields, etc., without saving to DB.
        await authorDoc.validate(); // If invalid (name or title too short), these will throw an error, jumping us to the 'catch' block.
        await book.validate();

        // Await book.save() and store the result in 'savedBook' so its data we can publish to subscribers.
        const savedBook = await book.save();

        // Update the Author's 'books' array to include the new book ID, otherwise Author.bookCount will stale in the Db.
        // Essential because the frontend's BOOK_DETAILS fragment expects an Author object, not just a raw ObjectId string from the Db
        authorDoc.books = authorDoc.books.concat(savedBook._id);
        await authorDoc.save();

        // Populate the author field before returning/publishing so the client receives the full author object, not just an ID.
        const populatedBook = await savedBook.populate("author");
        // The key 'bookAdded' matches your schema's subscription name.
        pubsub.publish("BOOK_ADDED", { bookAdded: populatedBook });

        return populatedBook;
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
    editAuthor: async (editAuthorParent, args, context) => {
      const authenticatedUser = context.currentUser;

      // Authorisation check: Ensure the user is logged in before allowing edits (request contains a valid user identity).
      if (!authenticatedUser) {
        // If context.currentUser is null, the token was missing, invalid, or expired.
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const authorToEdit = await Author.findOne({ name: args.name });
      // If the authorToEdit name not found, return null (per our schema).
      if (!authorToEdit) return null;
      // Update the Mongoose document property.
      authorToEdit.born = args.setBornTo;

      // Wrap in try/catch to handle validation errors during update.
      try {
        return await authorToEdit.save(); // Persist the change to MongoDB
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

  // The Subscription resolver defines how the server pushes data to clients.
  Subscription: {
    bookAdded: {
      // The subscribe function returns an 'AsyncIterableIterator' which stays open, listening for any 'publish' events with the 'BOOK_ADDED' label.
      subscribe: () => pubsub.asyncIterableIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
