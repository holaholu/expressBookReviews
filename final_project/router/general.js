const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let regd_users = require("./auth_users.js").authenticated;
let users = require("./auth_users.js").users;
let axios = require("axios");

const public_users = express.Router();

//public_users.post("/login", (req, res) => {});

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  let promise = new Promise((resolve, reject) => {
    resolve(books);
  })
    .then((result) => {
      res.status(200).send(JSON.stringify(result, null, 4));
    })
    .catch((err) => {
      res.status(404).send("Unable to retrieve book list! " + err);
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let promise = new Promise((resolve, reject) => {
    // Retrieve the isbn parameter from the request URL and send the corresponding book's details
    const isbn = req.params.isbn;
    //Obtain all the keys for the ‘books’ object.
    let keys = Object.keys(books);
    //Iterate through the keys & check the isbn matches the one provided in the request parameters.
    let correctbook = keys.filter((key) => books[key].isbn === isbn);
    let book = books[correctbook[0]];
    resolve(book);
  })
    .then((result) => {
      res.status(200).send(JSON.stringify(result, null, 4));
    })
    .catch((err) => {
      res.status(404).send("Unable to retrieve book list! " + err);
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Retrieve the author using axios and aync await
  const author = req.params.author;
  axios
    .get("http://localhost:5001")
    .then((response) => {
      //Obtain all the keys for the ‘response.data’ object.
      let keys = Object.keys(response.data);

      //Iterate through the keys & check the author matches the one provided in the request parameters.
      let correctbook = keys.filter((key) => books[key].author === author);
      let book = books[correctbook[0]];

      res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      res.status(404).send("Unable to retrieve book list! " + err);
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Retrieve the title using axios and aync await
  const title = req.params.title;
  axios
    .get("http://localhost:5001")
    .then((response) => {
      //Obtain all the keys for the ‘response.data’ object.
      let keys = Object.keys(response.data);

      //Iterate through the keys & check the author matches the one provided in the request parameters.
      let correctbook = keys.filter((key) => books[key].title === title);
      let book = books[correctbook[0]];

      res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      res.status(404).send("Unable to retrieve book list! " + err);
    });
 
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  // Retrieve the isbn parameter from the request URL and send the corresponding book's details
  const isbn = req.params.isbn;
  //Obtain all the keys for the ‘books’ object.
  let keys = Object.keys(books);

  //Iterate through the keys & check the isbn matches the one provided in the request parameters.
  let correctbook = keys.filter((key) => books[key].isbn === isbn);
  let review = books[correctbook[0]].reviews;

  res.status(200).send(JSON.stringify(review, null, 4));
});

module.exports.general = public_users;
