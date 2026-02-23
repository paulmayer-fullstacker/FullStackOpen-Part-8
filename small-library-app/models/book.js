// models/book.js:
// Data Models (models/): Mongoose schemas define how data is physically stored in MongoDB.
const mongoose = require("mongoose");
// Schema definition, dictating the structure of the documents within the MongoDb collection.
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5, // Minimum char count for book title. Requiring validation.
  },
  published: {
    type: Number,
  },
  author: {
    // N+1 Resolution: By using an ObjectId reference instead of a String, we enable Mongoose's .populate() method. This allows the server
    // to fetch the full author object in the same query as the book, eliminating the need for a separate database call for every book.
    type: mongoose.Schema.Types.ObjectId, // n+1 resolution: author changed from String to ObjectId reference.
    ref: "Author",
    required: true,
  },
  genres: [{ type: String }], // 'genres' field: Array of Strings. Not required, not unique, no restrictions to validate.
});
// Compile the schema into a Model named 'Book' and export. Mongoose automatically looks for a collection named 'books' (lowercase plural) in the Db.
module.exports = mongoose.model("Book", schema);
