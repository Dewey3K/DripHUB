'use strict';

(function (newChild) {
  let isLoggedIn;
  let USERNAME;
  const TWOSECS = 2000;
  const THREESECS = 3000;
  window.addEventListener('load', init);

  /**
   * Initializes the webpage
   */
  function init() {
    try {
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) {
        id('user-login').value = savedUsername;
      }
      id('home-btn').addEventListener('click', displayHome);
      id('navbar-login').addEventListener('click', displayLogin);
      id('navbar-signup').addEventListener('click', displaySignup);
      id('signup-form').addEventListener('submit', event => {
        createUser(event);
      });
      id('cancel-button').addEventListener('click', () => {
        id('buy-btn').disabled = false;
        id('confirm-transaction').classList.add('hidden');
        const confirmButton = id('confirm-button');
        const clonedConfirm = confirmButton.cloneNode(true);
        confirmButton.replaceWith(clonedConfirm);
        displayHome();
      });
      initiateButtons();
    } catch (err) {
      displayMsg('error', err);
    }
  }

  /**
   * Initiates event listeners for some buttons
   */
  function initiateButtons() {
    id('login-btn').addEventListener('click', displayLogin);
    id('signup-btn').addEventListener('click', displaySignup);
    id('navbar-profile').addEventListener('click', displayProfile);
    id('navbar-logout').addEventListener('click', logout);
    id('create-listing-btn').addEventListener('click', displayCreate);
    id('search-form').addEventListener('submit', event => {
      processSearch(event);
    });
    id('toggle-view-btn').addEventListener('click', changeListingView);
    id('login-submit').addEventListener('click', confirmLogin);
    id('create-btn').addEventListener('click', addListing);
  }

  /**
   * Processes the search filter form submission
   * @param {Event} event - The form submit event
   */
  async function processSearch(event) {
    event.preventDefault();
    const formData = new FormData(id('search-form'));
    try {
      const listings = await fetch('/driphub/search', {
        method: 'POST',
        body: formData
      });
      const checkedData = await statusCheck(listings);
      const parsedSearchListings = await checkedData.json();
      const productGrid = qs('#clothing-listings .product-grid');
      productGrid.innerHTML = '';
      parsedSearchListings.forEach(listing => {
        productGrid.append(createListing(listing));
      });
    } catch (err) {
      displayMsg('error', err);
    }
  }

  /**
   * Handles page layout when user logs out
   */
  function logout() {
    USERNAME = '';
    isLoggedIn = false;
    toggleLoggedInNavbar(isLoggedIn);
  }

  /**
   * Fetch all listings from server and display them
   */
  async function loadAllListings() {
    try {
      const response = await fetch('/driphub/listings');
      const confirmedResp = await statusCheck(response);
      const listings = await confirmedResp.json();
      const productGrid = qs('#clothing-listings .product-grid');
      while (productGrid.firstChild) {
        productGrid.firstChild.remove();
      }
      listings.forEach(listing => {
        productGrid.append(createListing(listing));
      });
    } catch (err) {
      console.error('Error while loading listings:', err);
    }
  }

  /**
   * Toggles the view of the listings from horizontal list to grid view and vice versa
   */
  function changeListingView() {
    const box = id('listing-box');
    box.classList.toggle('horiz-center');
    box.classList.toggle('vert-center');
  }

  /**
   * Creates an HTML representation of a product listing
   * @param {Object} listing - An object representing a product listing
   * @returns {HTMLElement} A div element representing the product listing
   */
  function createListing(listing) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    const productImg = document.createElement('img');
    productImg.src = listing.listingImage;
    productImg.alt = listing.listingName + ' preview';
    const productName = document.createElement('h3');
    productName.className = 'product-name';
    productName.textContent = listing.listingName;
    const productPrice = document.createElement('p');
    productPrice.className = 'product-price';
    productPrice.textContent = `$${listing.price.toFixed(2)}`;
    const productStock = document.createElement('p');
    productStock.textContent = listing.stock + ' items left';
    productCard.append(productImg, productName, productPrice, productStock);
    productCard.addEventListener('click', () => displayDetailedListing(listing.id));
    return productCard;
  }

  /**
   * Send user credentials to server for authentication
   * @param {Event} event - The form submit event
   */
  function confirmLogin(event) {
    event.preventDefault();
    const username = id('user-login').value;
    const password = id('user-password').value;
    id('user-login').value = '';
    id('user-password').value = '';
    const data = {username, password};
    fetch('/driphub/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => statusCheck(response))
      .then(response => response.json())
      .then(() => {
        setIsLoggedIn(username);
        localStorage.setItem('username', username);
        id('account-status').textContent = data.message;
        id('account-status').classList.remove('hidden');
        setTimeout(() => {
          id('account-status').classList.add('hidden');
        }, TWOSECS);
      })
      .catch((error) => {
        displayMsg('error', 'Error: ' + error);
      });
  }

  /**
   * Change the interface to indicate that a user is logged in
   * @param {string} username - The username of the logged in user
   */
  function setIsLoggedIn(username) {
    isLoggedIn = true;
    USERNAME = username;
    toggleLoggedInNavbar();
    displayHome();
  }

  /**
   * Toggles the navbar with the appropriate buttons for when there is a user logged in/not
   */
  function toggleLoggedInNavbar() {
    if (isLoggedIn) {
      id('navbar-login').classList.add('hidden');
      id('navbar-signup').classList.add('hidden');
      id('navbar-profile').classList.remove('hidden');
      id('navbar-logout').classList.remove('hidden');
      qs('body > h1').textContent = 'Welcome to DripHUB, ' + USERNAME + '!';
    } else {
      id('navbar-login').classList.remove('hidden');
      id('navbar-signup').classList.remove('hidden');
      id('navbar-profile').classList.add('hidden');
      id('navbar-logout').classList.add('hidden');
      qs('body > h1').textContent = 'Welcome to DripHUB!';
    }
  }

  /**
   * Sends a new user's credentials to the server for account creation
   * @param {Event} event - The form submit event
   */
  async function createUser(event) {
    event.preventDefault();
    const formData = new FormData(id('signup-form'));
    try {
      const newUser = await fetch('/driphub/createuser', {
        method: 'POST',
        body: formData
      });
      const checkedData = await statusCheck(newUser);
      const parsedUserData = await checkedData.text();
      id('account-status').textContent = parsedUserData;
      id('account-status').classList.remove('hidden');
      setTimeout(() => {
        id('account-status').classList.add('hidden');
      }, TWOSECS);
      displayHome();
    } catch (err) {
      displayMsg('error', err);
    }
    qs('#signup-form .email').value = '';
    qs('#signup-form .username').value = '';
    qs('#signup-form .password').value = '';
  }

  /**
   * Displays the home view
   */
  function displayHome() {
    loadAllListings();
    id('login-view').classList.add('hidden');
    id('signup-view').classList.add('hidden');
    id('specific-listing').classList.add('hidden');
    id('profile-view').classList.add('hidden');
    id('create-listing').classList.add('hidden');
    id('clothing-listings').classList.remove('hidden');
    id('confirm-transaction').classList.add('hidden');
  }

  /**
   * Displays the login view
   */
  function displayLogin() {
    id('login-view').classList.remove('hidden');
    id('signup-view').classList.add('hidden');
    id('specific-listing').classList.add('hidden');
    id('profile-view').classList.add('hidden');
    id('clothing-listings').classList.add('hidden');
    id('create-listing').classList.add('hidden');
    id('confirm-transaction').classList.add('hidden');
  }

  /**
   * Displays the sign up view
   */
  function displaySignup() {
    id('login-view').classList.add('hidden');
    id('signup-view').classList.remove('hidden');
    id('clothing-listings').classList.add('hidden');
    id('specific-listing').classList.add('hidden');
    id('create-listing').classList.add('hidden');
    id('profile-view').classList.add('hidden');
    id('confirm-transaction').classList.add('hidden');
  }

  /**
   * Displays the profile view
   */
  function displayProfile() {
    id('login-view').classList.add('hidden');
    id('signup-view').classList.add('hidden');
    id('clothing-listings').classList.add('hidden');
    id('specific-listing').classList.add('hidden');
    id('profile-view').classList.remove('hidden');
    id('create-listing').classList.add('hidden');
    if (!isLoggedIn) {
      id('not-logged-in').classList.remove('hidden');
      return;
    }
    id('not-logged-in').classList.add('hidden');
    displayCurrentListings();
    displayPreviousTransactions();
    id('confirm-transaction').classList.add('hidden');
  }

  /**
   * Displays the create listing view
   */
  function displayCreate() {
    id('login-view').classList.add('hidden');
    id('signup-view').classList.add('hidden');
    id('clothing-listings').classList.add('hidden');
    id('specific-listing').classList.add('hidden');
    id('profile-view').classList.add('hidden');
    id('create-listing').classList.remove('hidden');
    id('confirm-transaction').classList.add('hidden');
  }

  /**
   * Send new listing data to server for creation
   * @param {Event} event - The form submit event
   */
  function addListing(event) {
    event.preventDefault();
    const form = id('create-listing-form');
    const itemName = form.elements['item-name'].value;
    const itemLink = form.elements['item-link'].value;
    const price = parseFloat(form.elements.price.value);
    const clothingType = form.elements['clothing-type'].value;
    const stock = form.elements.stock.value;
    const listingData = {itemName, itemLink, price, clothingType, seller: USERNAME, stock};
    const oneHalfSec = 1500;
    fetch('/driphub/createlisting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listingData)
    })
      .then(response => statusCheck(response))
      .then(response => response.json())
      .then(() => {
        displayMsg('feedback', 'Listing created successfully');
        setTimeout(() => {
          displayHome();
        }, oneHalfSec);
      })
      .catch(error => {
        displayMsg('error', 'An error occurred while creating the listing:' + error);
      });
  }

  /**
   * Fetch and display all of a user's past transactions
   */
  function displayPreviousTransactions() {
    fetch('/driphub/profile/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: USERNAME})
    })
      .then(response => statusCheck(response))
      .then(response => response.json())
      .then(transactions => {
        id('user-transactions').innerHTML = '';
        transactions.forEach(transaction => {
          fetch(`/driphub/listings/${transaction.listingID}`)
            .then(response => statusCheck(response))
            .then(response => response.json())
            .then(data => {
              transactionToCard(data, transaction);
            })
            .catch(err => {
              displayMsg('error', 'Error while loading Listings: ' + err);
            });
        });
      })
      .catch(err => {
        displayMsg('error', 'Error retrieving buyer transactions:' + err);
      });
  }

  /**
   * turns data and transaction into a listing card
   * @param {Object} data - object with card data
   * @param {Object} transaction - transaction data
   */
  function transactionToCard(data, transaction) {
    const card = createListing(data);
    const div = gen('div');
    const date = gen('p');
    const confId = gen('p');
    if (transaction.confirmationId) {
      confId.textContent = transaction.confirmationId;
    } else {
      confId.textContent = 'No Confirmation Id';
    }
    date.textContent = transaction.timePurchased;
    div.appendChild(card);
    div.appendChild(date);
    div.appendChild(confId);
    div.classList.add('transaction');
    id('user-transactions').appendChild(div);
  }

  /**
   * Fetch and display all of a user's current listings
   */
  function displayCurrentListings() {
    id('user-listings').innerHTML = '';
    fetch('/driphub/profile/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: USERNAME})
    })
      .then(response => statusCheck(response))
      .then(response => response.json())
      .then(listings => {
        listings.forEach(data => {
          const card = createListing(data);
          const div = gen('div');
          const date = gen('p');
          div.appendChild(card);
          div.appendChild(date);
          div.classList.add('listing');
          id('user-listings').appendChild(div);
        });
      })
      .catch(err => {
        console.error('Error retrieving seller transactions:', err);
      });
  }

  /**
   * Fetch and display the details of a specific listing
   * @param {string} listingId - The ID of the listing to fetch and display
   */
  function displayDetailedListing(listingId) {
    id('specific-listing').innerHTML = '';
    const name = gen('p');
    const image = gen('img');
    const price = gen('p');
    const seller = gen('p');
    const buy = gen('button');
    buy.textContent = 'Buy';
    buy.id = 'buy-btn';
    buy.addEventListener('click', () => handlePurchase(listingId));
    id('specific-listing').appendChild(name);
    id('specific-listing').appendChild(image);
    id('specific-listing').appendChild(price);
    id('specific-listing').appendChild(seller);
    id('specific-listing').appendChild(buy);
    fetch(`/driphub/listings/${listingId}`)
      .then(response => statusCheck(response))
      .then(response => response.json())
      .then(listing => {
        name.textContent = listing.listingName;
        name.classList.add('detailed-heading');
        image.src = listing.listingImage;
        image.classList.add('detailed-image');
        price.textContent = `$${listing.price.toFixed(2)}`;
        price.classList.add('detailed-subtext');
        seller.textContent = 'Seller: ' + listing.seller;
        seller.classList.add('detailed-subtext');
        toggleSpecifics();
      })
      .catch(err => {
        displayMsg('error', 'Error while loading Listings: ' + err);
      });
  }

  /**
   * toggles specific listing view
   */
  function toggleSpecifics() {
    id('specific-listing').classList.remove('hidden');
    id('login-view').classList.add('hidden');
    id('signup-view').classList.add('hidden');
    id('clothing-listings').classList.add('hidden');
    id('profile-view').classList.add('hidden');
  }

  /**
   * Handle the process of a user purchasing a listing
   * @param {string} listingId - The ID of the listing to be purchased
   */
  function handlePurchase(listingId) {
    if (!isLoggedIn) {
      displayMsg('error', 'Must be logged in');
      return;
    }
    id('buy-btn').disabled = true;
    id('confirm-transaction').classList.remove('hidden');
    id('confirm-button').addEventListener('click', () => submitTransaction(listingId));
  }

  /**
   * Handles logic for when the user decides to buy a certain listing
   * @param {number} listingId - The id of the listing that is going to be bought
   */
  function submitTransaction(listingId) {
    id('confirm-button').disabled = true;
    const data = {listingId, buyer: USERNAME};
    fetch('/driphub/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => statusCheck(response))
      .then(response => response.json())
      .then(resp => {
        displayMsg('feedback', 'Purchase success, ' +
      'you will be redirected soon. Your confirmation id is ' + resp.confirmationId);
      })
      .catch((error) => {
        displayMsg('error', 'Purchase Failed: ' + error);
      })
      .finally(() => {
        setTimeout(() => {
          id('buy-btn').disabled = false;
          id('confirm-transaction').classList.add('hidden');
          id('confirm-button').disabled = false;
          const clonedConfirm = id('confirm-button').cloneNode(true);
          id('confirm-button').replaceWith(clonedConfirm);
          displayHome();
        }, THREESECS);
      });
  }

  /**
   * Display a message to the user
   * @param {string} type - The type of message, either "error" or "feedback"
   * @param {string} msg - The message to display
   */
  function displayMsg(type, msg) {
    const twoPointFive = 2500;
    const errorElement = id(type);
    errorElement.textContent = msg;
    setTimeout(() => {
      errorElement.textContent = '';
    }, twoPointFive);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} query - CSS query selector.
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qs(query) {
    return document.querySelector(query);
  }

  /**
   * Returns generated element corresponding to tagname
   * @param {string} tagName - Element Tagname
   * @returns {object} - DOM object associated selector.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();