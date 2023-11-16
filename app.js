'use strict';
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require('multer');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
const SERVER_ERROR = 500;
const INVALID_REQ = 400;
const VALID = 200;
const PORT_NUMBER = 8000;

// Get all listings
app.get('/driphub/listings', async (req, res) => {
  try {
    const db = await getDBConnection();
    const queryGetListings = 'SELECT * FROM listings ORDER BY id DESC';
    const listings = await db.all(queryGetListings);
    res.json(listings);
  } catch (err) {
    res.status(SERVER_ERROR)
      .send('An error occurred on the server. Try again later.');
    console.error(err);
  }
});

// Gets listings that match filter parameters from the post request
app.post('/driphub/search', async (req, res) => {
  const search = req.body['listings-search'];
  const minPrice = parseInt(req.body['min-price']);
  const maxPrice = parseInt(req.body['max-price']);
  const clothingType = req.body['clothing-type'];
  try {
    const db = await getDBConnection();
    const query = 'SELECT * FROM listings WHERE listingName LIKE ? AND price BETWEEN ? AND ? ' +
      'AND type LIKE ?';
    const rows = await db.all(query, ['%' + search + '%', minPrice,
      maxPrice, clothingType]);
    res.type('json').status(VALID)
      .send(rows);
    await db.close();
  } catch (err) {
    res.type('text').status(SERVER_ERROR)
      .send('An error occurred on the server. Try again later.');
  }
});

// Get a specific listing by its ID
app.get('/driphub/listings/:id', async (req, res) => {
  try {
    const db = await getDBConnection();
    const queryGetListing = 'SELECT * FROM listings WHERE id = ?';
    const listing = await db.get(queryGetListing, req.params.id);
    if (listing) {
      res.json(listing);
    } else {
      res.status(INVALID_REQ)
        .send('Listing not found');
    }
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR)
      .send('Server error');
  }
});

// Process a purchase, recording it in the transactions table
app.post('/driphub/purchase', async (req, res) => {
  try {
    const {buyer, listingId} = req.body;

    const db = await getDBConnection();

    const queryGetStock = 'SELECT stock FROM listings WHERE id = ?';
    const row = await db.get(queryGetStock, [listingId]);

    if (!row || row.stock <= 0) {
      res.status(INVALID_REQ)
        .send({success: false, message: 'Out of stock or invalid listing.'});
      return;
    }

    const queryUpdateStock = 'UPDATE listings SET stock = stock - 1 WHERE id = ?';
    await db.run(queryUpdateStock, [listingId]);
    const length = 36;
    const base = 9;
    const confirmationId = Date.now().toString(length) + Math.random().toString(length)
      .substr(2, base);
    const queryInsertPurchase = 'INSERT INTO transactions (confirmationId, buyer, listingId) ' +
      'VALUES (?, ?, ?)';
    await db.run(queryInsertPurchase, [confirmationId, buyer, listingId]);
    res.status(VALID)
      .send({success: true, confirmationId});
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR)
      .send({success: false, message: err});
  }
});

// Create a new listing in the listings table
app.post('/driphub/createlisting', async (req, res) => {
  try {
    const {itemName, itemLink, price, clothingType, seller, stock} = req.body;

    const db = await getDBConnection();
    const queryInsertListing = 'INSERT INTO listings (listingName, listingImage, price, type, ' +
      'seller, stock) VALUES (?, ?, ?, ?, ?, ?)';
    await db.run(queryInsertListing, [itemName, itemLink, price, clothingType, seller, stock]);

    res.status(VALID).json({success: true});
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(SERVER_ERROR).json({success: false, error: err});
  }
});

// Retrieve a user's transactions
app.post('/driphub/profile/transactions', async (req, res) => {
  try {
    const {username} = req.body;

    const db = await getDBConnection();
    const queryGetTransactions = 'SELECT * FROM transactions WHERE buyer = ? ORDER BY ' +
      'timePurchased DESC';
    const transactions = await db.all(queryGetTransactions, username);

    res.json(transactions);
  } catch (err) {
    console.error('Error retrieving transactions:', err);
    res.status(SERVER_ERROR)
      .send('An error occurred while retrieving transactions');
  }
});

// Retrieve a user's listings
app.post('/driphub/profile/listings', async (req, res) => {
  try {
    const {username} = req.body;

    const db = await getDBConnection();
    const queryGetListings = 'SELECT * FROM listings WHERE seller = ?';
    const listings = await db.all(queryGetListings, username);

    res.json(listings);
  } catch (err) {
    console.error('Error retrieving listings:', err);
    res.status(SERVER_ERROR)
      .send('An error occurred while retrieving listings');
  }
});

// Log a user in, checking their credentials against the users table
app.post('/driphub/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    try {
      const db = await getDBConnection();
      const queryCheckUser = 'SELECT * FROM users WHERE username = ?';
      const user = await db.get(queryCheckUser, username);
      if (user) {
        if (user.password === password) {
          res.type('json').status(VALID)
            .send({success: true, message: 'Logged in successfully!'});
        } else {
          res.type('json').status(VALID)
            .send({success: false, message: 'Incorrect password.'});
        }
      } else {
        res.type('json').status(VALID)
          .send({success: false, message: 'User not found.'});
      }
    } catch (err) {
      res.type('json').status(SERVER_ERROR)
        .send({success: false, message: 'An error occurred on the server. Try again later.'});
    }
  } else {
    res.type('json').status(INVALID_REQ)
      .send({success: false, message: 'Both username and password must be provided.'});
  }
});

// Create a new user in the users table
app.post('/driphub/createuser', async (req, res) => {
  const email = req.body.email.trim();
  const username = req.body.username.trim();
  const password = req.body.password.trim();
  if (email && username && password) {
    try {
      const db = await getDBConnection();
      const queryCheckUser = 'SELECT username FROM users WHERE username LIKE ?';
      const nameCheck = await db.get(queryCheckUser, username);
      if (JSON.stringify(nameCheck)) {
        res.type('text').status(VALID)
          .send('Yikes. User already exists.');
      } else {
        res.type('text').status(VALID)
          .send('Created User');
      }
    } catch (err) {
      res.type('text').status(SERVER_ERROR)
        .send('An error occurred on the server. Try again later.');
    }
  } else {
    res.type('text').status(INVALID_REQ)
      .send('Missing one or more of the required parameters.');
  }
});

/**
 * Establishes connection to the database
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'driphub.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUMBER;
app.listen(PORT);
