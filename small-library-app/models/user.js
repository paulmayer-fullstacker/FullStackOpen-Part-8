// models/user.js:
// Data Models (models/): Mongoose schemas define how user and favourite genre data is stored in MongoDB.
const mongoose = require("mongoose"); // Imports mongoose library (an Object Data Modeling (ODM) tool for MongoDB and Node.js).
// Create new instance of a Mongoose Schema to define the structure and rules of our 'User' documents.
const schema = new mongoose.Schema({
  // Defines data fields for the user: 'username', 'favoriteGenre'.
  username: {
    // Define data type and characteristics.
    type: String,
    required: true,
    unique: true,
    minlength: 3, // Minimum char count for username. Requiring validation.
  },
  favoriteGenre: {
    // Schema key name from task brief.
    type: String,
    required: true,
  },
});
// Compile the schema into a Model and export it.  Model name 'User'; Mongoose will look for a collection named 'users' (plural/lowercase).
module.exports = mongoose.model("User", schema);
