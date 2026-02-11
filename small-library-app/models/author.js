// models/author.js:
// Data Models (models/): Mongoose schemas define how data is physically stored in MongoDB.
const mongoose = require("mongoose"); // Imports mongoose library (an Object Data Modeling (ODM) tool for MongoDB and Node.js).
// Create new instance of a Mongoose Schema to define the structure and rules of our 'Author' documents.
const schema = new mongoose.Schema({
  // Defines data fields for the author: 'name', 'born'.
  name: {
    // Define data type and characteristics
    type: String,
    required: true,
    unique: true,
    minlength: 4, // Minimum char count for author's name. Requiring validation.
  },
  born: {
    // Optional. Not required and not unique.
    type: Number,
  },
});
// Compile the schema into a Model and export it.  Model name 'Author'; Mongoose will look for a collection named 'authors' (plural/lowercase).
module.exports = mongoose.model("Author", schema);
