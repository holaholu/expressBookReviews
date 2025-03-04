const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Extract email parameter from request URL
  const isbn = req.params.isbn;
  const reviewMade = req.query.review;
  const userReviewing = req.session.authorization.username;

  //Obtain all the keys for the ‘books’ object.
  let keys = Object.keys(books);

  //Iterate through the keys & check the isbn matches the one provided in the request parameters.
  let correctbook = keys.filter((key) => books[key].isbn === isbn);
  let book = books[correctbook[0]];

  if (book) {
    // Check if book exists
    let reviews = book.reviews; // current reviews in book

    // if current user has already made a review, update his review with new review
    if (reviews[userReviewing]) {
      reviews[userReviewing] = reviewMade; // Update review for current user
    } else {
      // if current user has not made a review, add new review
      let newReview = { [userReviewing]: reviewMade };
      reviews = { ...reviews, ...newReview }; // Update reviews object with new review
    }

    book["reviews"] = reviews; // Update 'reviews' property in book object
    books[correctbook[0]] = book; // Update book details in 'books' object
    res.send(`Review for book with ISBN ${isbn} updated.`);
  } else {
    // Respond if book with specified ISBN is not found
    res.send("Unable to find book!");
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  //Obtain all the keys for the ‘books’ object.
  let keys = Object.keys(books);

  //Iterate through the keys & check the isbn matches the one provided in the request parameters.
  let correctbook = keys.filter((key) => books[key].isbn === isbn);
  let book = books[correctbook[0]];

  if (book) {
    //Delete book
    delete books[correctbook[0]];
    res.send(`Book with ISBN ${isbn} deleted.`);
  } else {
    // Respond if book with specified ISBN is not found
    res.send("Unable to find book!");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
