// seed-mongo-db-n+1.js:
const mongoose = require("mongoose"); // Import the Mongoose library to handle the connection and data insertion to MongoDB.
require("dotenv").config(); // Load our MONGODB_URI variable from .env into process.env.
// Import the requird Mongoose models to interact with the MongoDB collections.
const Author = require("./models/author"); // Imports Author model to define how author documents should be structured in the collection.
const Book = require("./models/book"); // Import Book model ... .
const User = require("./models/user"); // Users and their favourite genre.
const { testAuthors, testBooks, testUsers } = require("./utils/seeding_data"); // Destructures the arrays of seeding data (testAuthors and testBooks).

const seedDatabase = async () => {
  try {
    // Log the start of the process and uses the URI from .env to establish a database connection.
    console.log("Connecting to MongoDB...");
    // Establish connection using your URI from the .env file.
    await mongoose.connect(process.env.MONGODB_URI);
    // Wipe the collections clean to avoid duplicate key errors on re-seed.
    console.log("Clearing existing data...");
    await Author.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});

    // Seed Users directly from the testUsers array (legacy).
    console.log("Seeding users...");
    await User.insertMany(testUsers);

    // // Seed Authors directly from the testAuthors array.
    console.log("Seeding authors...");
    // Save the created authors to a variable so we can access their ids
    const createdAuthors = await Author.insertMany(testAuthors);

    // Seed Books (The mapping step)
    console.log("Seeding books and linking to authors...");

    // We create the books one by one or via a mapped array to handle the IDs
    const bookDataWithIds = testBooks.map((book) => {
      // Find the author object from the 'createdAuthors' array that matches the name string
      const authorDoc = createdAuthors.find((a) => a.name === book.author);
      return {
        ...book,
        author: authorDoc._id, // Replace the String name with the actual ObjectId
      };
    });

    const createdBooks = await Book.insertMany(bookDataWithIds);

    // Update Authors with their Book ids (n+1 fix)
    console.log("Updating author book references...");
    // For each author, find the books they wrote and add those ids to the 'books' array.
    for (let author of createdAuthors) {
      const authorsBooks = createdBooks.filter(
        (b) => b.author.toString() === author._id.toString(),
      );
      author.books = authorsBooks.map((b) => b._id);
      await author.save();
    }
    // Log template literal proclaiming success and confiring how may items (authors / boks) seeded.
    console.log(
      `Success! Seeded ${createdAuthors.length} authors, ${createdBooks.length} books, and ${testUsers.length} users.`,
    );
  } catch (error) {
    // Log any errors (like validation failures or connection timeouts)
    console.error("Error seeding database:", error.message);
  } finally {
    // Finally (regardless of success or failure), close the connection so the script exits the terminal.
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};
// Invokes the seedData function defined above, to execute the seeding script.
seedDatabase();
