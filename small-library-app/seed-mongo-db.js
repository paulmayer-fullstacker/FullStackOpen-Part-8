// seed-mongo-db.js:
const mongoose = require("mongoose"); // Import the Mongoose library to handle the connection and data insertion to MongoDB.
require("dotenv").config(); // Load our MONGODB_URI variable from .env into process.env.
// Import the requird Mongoose models to interact with the MongoDB collections.
const Author = require("./models/author"); // Imports Author model to define how author documents should be structured in the collection.
const Book = require("./models/book"); // Import Book model ... .
const { testAuthors, testBooks } = require("./utils/seeding_data"); // Destructures the arrays of seeding data (testAuthors and testBooks).
// Defines asynchronous function to handle the sequential steps of the database seeding process.
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

    // Seed Authors directly from the testAuthors array.
    console.log("Seeding authors...");
    await Author.insertMany(testAuthors);

    // Seed Books directly from the testBooks array. Since 'author' is just a String in your model, no ID mapping is needed.
    console.log("Seeding books...");
    await Book.insertMany(testBooks);
    // Log template literal proclaiming success and confiring how may items (authors / boks) seeded.
    console.log(
      `Success! Seeded ${testAuthors.length} authors and ${testBooks.length} books.`,
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
