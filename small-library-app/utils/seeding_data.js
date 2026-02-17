// utils/seeding_data.js:
// User Data
const testUsers = [
  {
    username: "testuser1",
    favouriteGenre: "refactoring",
  },
  {
    username: "testuser2",
    favouriteGenre: "classic", // Users must have a favourite genre at seeding.
  },
];

// Author Data
const testAuthors = [
  {
    name: "Robert Martin",
    // id: Removed. MongoDb will apply it's own unique id on data insertion.
    born: 1952,
  },
  {
    name: "Martin Fowler",

    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",

    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known

    // born: nullable
  },
  {
    name: "Sandi Metz", // birthyear not known
  },
];

// Book Data
const testBooks = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin", // author stored as a String, NOT an Author object.

    genres: ["refactoring"], // genres: array of Strings. Not an array of genre enumes or objects.
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",

    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",

    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",

    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",

    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",

    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",

    genres: ["classic", "revolution"],
  },
];

// Exports the arrays containng author and book data for use in both seeding and testing scripts.
module.exports = {
  testUsers,
  testAuthors,
  testBooks,
};
