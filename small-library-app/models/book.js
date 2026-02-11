// models/book.js:
// Data Models (models/): Mongoose schemas define how data is physically stored in MongoDB.
const mongoose = require("mongoose");

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
  genres: [{ type: String }],
});

module.exports = mongoose.model("Book", schema);
