# Full Stack Open: Exercises for Part-8 - GraphQL

## Introduction:

Herewith my submission of the exercises required for Module-8. The module repo contains two projects, implementing the frontend and the backend of my 'Library' application.

---

## The Solution:

The solution consists of two distinct project files contained within my FullStackOpen-Part-8 repository:

- small-library-app (the backend), is a Node.js server using Apollo Server (GraphQL execution engine) and MongoDB.
- small-library-frontend (the frontend), is a React application using Apollo Client to manage data and GraphQL to communicate with the server.

### Development Snapshots (Tags):

Tags have been used to take development snapshots and key milestones. The tags are:

- milestone/part8-exercises-8.1-8.7
- milestone/part8-exercises-8.8-8.12
- milestone/part8-exercises-8.13-8.16
- milestone/part8-exercises-8.17-8.20
- milestone/part8-exercises-8.21-8.22

Exercises 8.23-8.26 represent the final stages of development, and the final publication of code to the repo.

### Documentation:

The scripts have been judiciously commented with inline documentation. So, we will not indulge in further explanation. We will simply cover the bare minimum information required to run the project applications.

### Running the Apps:

Having drawn down the code, within each project, run npm install. This will install the dependencies listed within the package.json file.

Within each project, run: npm run dev. The backend can be run, and tested, in isolation. However, the test script described in this document concentrates on testing the whole application. So, start the backend, then start the frontend.

---

## Debugging:

### Exercise 8.20.

After experiencing problems rendering the recommended/favourite books, I placed sequential validation in the recommend logic to isolate the bug.
Having fixed the problem, I realised that the validation logic was inconsistent, with its own intermittent/phantom bug. The validation logic was not a requirement of the exercise. So, the easy solution was to simply removed that redundant code.

The commented code for the difficult solution can be found at src/components/Recommend.jsx lines 12-15.

### Exercise 8.26 (n+1 Problem):

The n+1 problem is a silent performance killer that primarily lives in the 'List views', where one type of data depends on another. Thus, validation the performance of the solution was challenging. The problem was present at two critical points:

- The Authors view (allAuthors -> bookCount).
- The Books view (allBooks -> author).

Validating the Authors view logic was reasonably strait forward, by including a console log message inside Author.bookCount. This can still be found in resolvers.js lines 72/73.

Validating allBooks -> author could not be achieved with a simple console log command. Further logic would have been required to log a message. So, I utilised the Database logging in Mongoose to confirm that the authors for allBooks were retrieved with a single call to the database.

Within the db.js file, mongoose debugging is switched on/off at lines 8/9. With debugging on, every call to the database is logged at the backend terminal. Mongoose debugging does present a performance burden. So, when not in use, the code is commented out.

---

## The n+1 Problem:

The early exercises for Module-8 followed a logical and simple development progression. However, the later exercises (particularly the last: 8.26), demanded a design shift and significantly more work. Exercise 8.26 raised the n+1 problem. As my solution to this problem is presented as the summit of module-8, it demands more detailed exploration.

Overstacked (https://www.youtube.com/watch?v=N78yJmkWjSU&t=11863s), recommends employing employing the DataLoader library to address the n+1 problem. However, this involved learning a new library, to abstract away from the problem. The course material and example application leaned towards an eager loading solution, via Mongoose, that helped to further explore the problem.

The N+1 problem occurs because of Lazy Loading. That is, fetching related data only at the exact moment a specific field resolver is executed. While this minimal, just-in-time fetching is a core principle of GraphQL’s flexibility, it can lead to poor performance by triggering many small, individual calls to the database.

Eager Loading solves this by "over-fetching" the related data upfront in a single, larger batch.

In our Library App, I have implemented eager loading using the Mongoose .populate() method. This is a server-side (middleware) function that intercepts the database result. Before the data is sent to the GraphQL resolvers, .populate() identifies any ObjectIds in the specified fields, performs a batched query to the related collection, and "stitches" the related documents into the original result.

Solving the n+1 problem lead to a design shift, from a flat data structure to a relational data structure. At the beginning of the module-8 exercises the database was just a collection of independent lists. By the end, and for the purpose of our application, the database was a matrix of interconnected references. To accommodate this structural change, a new/revised database seeding script was required. The script: 'seed-mongo-db.js' (executed with: npm run seed), is applicable for all but the final development stage. For the final release of the code, 'seed-mongo-db-n+1.js' (executed with: npm run n+1seed), must be used. The seeding data is the same for both applications.

Implementing the n+1 solution was challenging, in itself. The small structural changes required to enforce the book/author relationships (i.e., representing a books author as an Author rather than a string), generated many unexpected bugs. Devising and then rigorously expediting the test plan, helped to flush out, and then run down these bugs.

---

## Final Test Suite (inc. the n+1 solution).

Library App: Manual Test Protocol:

### 1: The N+1 Verification (Backend Focus):

From the backend terminal run: npm run n+1seed.

Check MongoDb Cluster0 smallLibraryApp books. Confirm that author field is now an ObjectId, not a String.

Before testing the UI, we must prove the database performance fix is working.

Preparation: Observe the terminal where the backend is running.

Action: Open Apollo Sandbox (or GraphQL Playground) and run this GraphQL query:

query {
allAuthors {
name
bookCount
}
}

Validation: Check the server console.

- Pass: We should see your debug log 'N+1 Check: Resolving bookCount for...' print exactly once for each author in the database.
- Fail: If you see dozens of logs or repeating author names, the populate('books') logic in allAuthors isn't being utilised correctly.

---

### 2: Authentication & Authorisation

Testing the security boundaries.

1.   Guest Access:

- Open the frontend. We should see 'Authors', 'Books', and 'login'.
- Validation: The "Add Book" and "Recommend" buttons must be hidden.
    Validation: We should start at the Authors view, where 'Set Birthyear' form should not be visible..
- Action: Navigate to the 'books' view.A list of pre-seeded books and genre buttons are visible.
- Action: Selecting a genre button filters the list of books by genre.

2.   Login Flow:

- Click "Login". Enter a valid username (e.g., `testuser1`) and the password `secret`.
- Validation: You should be redirected to 'Authors' view. A token (key: admin-user-token), should now exist in our browser's Local Storage (Inspect -> Application -> Local Storage).

3.   Restricted Access:

- Now that we are logged in, verify that 'Add Book' and 'Recommend' buttons have appeared. Also, that the 'Set Birthyear' form is now visible on the 'Authors' view.

---

### 3: The "Add Book" & Cache Sync

Testing the mutation and the manual cache update logic.

1.   Action: Go to "Add Book". Add a new book, with a new author.
2.   Validation (Instant UI):

- A New Book notification will appear at the top of the view.
- Navigate immediately to the 'Books' page.
- Pass: The book appears in the list without having to refresh the browser. This proves our `update` function and `addNewBookToCache` helper are working.

3.   Validation (Side Effect)

- Check the 'Authors' page. The new author should now be in the list, and their `bookCount` should be 1.

4. Action: Use the 'Set Birthyear' form to set a birth year for the new author.

- Validation: Confirm that the author details are updated immediately.

---

### 4: Recommendations (User Context)

Testing if the app correctly filters based on the `me` query.

1.   Action: Click "Recommend".
2.   Validation:

- The page should display: _"books in your favourite genre [Your Genre]"_.
- The table should only show books matching that genre. For testuser1 the favourite genre is refactoring.

3.   Action: Log out, log in as a different user with a different favourite genre.

- Validation: The recommendation list must update to reflect the new user’s preferences.

---

### 5: Real-time Subscriptions (Multi-Window)

Testing the WebSocket connection.

1.   Preparation: Open our Library App in two separate browser windows (A and B). Set browser B to the books view.
2.   Action: In Window A, log in and add a new book.
3.   Observation: Look at Window B (can be logged out).

4.   Validation:

- Pass: A notification (using our `Notify` component) should appear in browser B saying _"New book added:..."_.
- Pass: Browser B: the new book should appear in the table automatically via the subscription's cache update.
- The Author view will not update automatically, as this feature has not been implemented. Switch to the 'Authors' view. and refresh the page. The new author will now appear.

---

### 6: Error Handling (The "Safety Net")

1.   Validation: Try to add a book with a title shorter than the Mongoose validation (usually 5 chars).

- Pass: A red error message from our `Notify` component should appear, showing the specific Mongoose error message.
    Error message: Book validation failed: title: Path `title` (`Book`, length 4) is shorter than the minimum allowed length (5).

2.   Validation: Try to set a birthyear for an author without selecting a name.

- Pass: Our frontend validation should trigger: _"Please provide a valid birthyear"_.

---

## Version Control

All three project files have been pushed to my GitHub repository at https://github.com/paulmayer-fullstacker/FullStackOpen-Part-8.

---

<br/>

<hr style="height: 5px; background-color: black; border: none;">
