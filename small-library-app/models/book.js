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
    type: String,
    required: true,
  },
  genres: [{ type: String }], // 'genres' field: Array of Strings. Not required, not unique, no restrictions to validate.
});
// Compile the schema into a Model named 'Book' and export. Mongoose automatically looks for a collection named 'books' (lowercase plural) in the Db.
module.exports = mongoose.model("Book", schema);
