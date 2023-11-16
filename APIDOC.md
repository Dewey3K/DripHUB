# DripHUB API Documentation
The DripHUB API provides information about seller information on the platform, as well as clothing listings that can be curated by a set of parameters.

## Get Clothing Listings
**Request Format:** /driphub/listings

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns a JSON containing individual clothing listing objects of all listings

**Example Request:** /driphub/listings

**Example Response:**

```json
[{
    "id": 798,
    "listingName": "Black Chino Pants",
    "listingImage": "https://i.imgur.com/QgE67fG.jpg",
    "seller": "JoeBilly",
    "price": 34.69,
    "type": "Shorts"
},
{
    "id": 738,
    "listingName": "Adidas Jacket",
    "listingImage": "https://i.imgur.com/QgE1232A.jpg",
    "seller": "Bobberz",
    "price": 33.69,
    "type": "Jacket"
}]
```

**Optional Route Parameter:** /driphub/listings/:id

**Optional Route Example:** /driphub/listings/798

**Example Response:**

```json
{
    "id": 798,
    "listingName": "Black Chino Pants",
    "listingImage": "https://i.imgur.com/QgE67fG.jpg",
    "seller": "JoeBilly",
    "price": 34.69,
    "type": "Shorts"
}
```

**Error Handling:**
- Possible 400 errors (all plain text):
  - If listing id is not valid: `Listing not found`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred on the server. Try again later`

## Get Filtered Listing Information
**Request Format:** /driphub/search

**Request Type:** POST

**Returned Data Format:** JSON

**Description:** Returns JSON of all listings that match filter params

**Example Request:** /driphub/search

**Example Response:** (searching for shirts and price is between 30 and 40)

```json
[{
    "id": 728,
    "listingName": "Navy Blue Tee",
    "listingImage": "https://i.imgur.com/QgE67fG.jpg",
    "seller": "JoeBilly",
    "price": 38.69,
    "type": "Shirts"
},
{
    "id": 731,
    "listingName": "Bunny T Shirt",
    "listingImage": "https://i.imgur.com/QgE1232A.jpg",
    "seller": "Bobberz",
    "price": 33.69,
    "type": "Shirts"
}]
```
**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred on the server. Try again later`

## Send Purchase to Database
**Request Format:** /driphub/purchase

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns JSON with confirmation ID of the transaction that was made

**Example Request:** /driphub/purchase

**Example Response:**

```json
 { "success": true, "confirmationId": "lijzdorv6jv4clk61"}
```
**Error Handling:**
- Possible 400 errors (json):
  - If stock is out on the listing, returns an error with the json:
  `{ success: false, message: "Out of stock or invalid listing." }`
- Possible 500 errors (json):
  - If something else goes wrong on the server, returns an error with the json: 
  `{ success: false, error: err }` where err is the caught error

## Create a Clothing Listing
**Request Format:** /driphub/createlisting

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns JSON w info that the listing sent through the form was successfully created


**Example Request:** /driphub/createlisting

**Example Response:**

```json
    {"success": true}
```

**Error Handling:**
- Possible 500 errors (json):
  - If something else goes wrong on the server, returns an error with the message: 
  `{ success: false, error: err }` where err is the caught error
  
## Retrieve User Profile Information
**Request Format:** /driphub/profile/transactions

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns JSON of all transactions relevant to logged in profile sent through form

**Example Request:** /driphub/profile/transactions

**Example Response:**

```json
[{
    "transID": 2,
    "buyer": "barrels",
    "listingID": 3,
    "timePurchased": "2023-06-05 23:12:18",
    "confirmationId": "lijzfhtmvfmwu8rqh"
},
{
     "transID": 3,
     "buyer": "hanrui",
     "listingID": 2,
     "timePurchased": "2023-06-04 21:12:18",
     "confirmationId": "lijasdfafs2fasdf3"

}]
```
**Request Format:** /driphub/profile/listings

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns JSON of all listings relevant to logged in profile sent through form


**Example Request:** /driphub/profile/listings

**Example Response:**

```json
[{
    "id": 798,
    "listingName": "Black Chino Pants",
    "listingImage": "https://i.imgur.com/QgE67fG.jpg",
    "seller": "JoeBilly",
    "price": 34.69,
    "type": "Shorts"
},
{
    "id": 738,
    "listingName": "Adidas Jacket",
    "listingImage": "https://i.imgur.com/QgE1232A.jpg",
    "seller": "JoeBilly",
    "price": 33.69,
    "type": "Jacket"
}]
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `An error occurred while retrieving transactions`
  
## User Log In
**Request Format:** /driphub/login

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns JSON of whether the login was successful or not


**Example Request:** /driphub/login

**Example Response:**

```json
 { "success": true, "confirmationId": "logged in successfully!"}
```
**Error Handling:**
- Possible 400 errors (json):
  - If something goes wrong with user parameters, returns with the json:
  `{ success: false,message: "Both username and password must be provided." }`
- Possible 500 errors (json):
  - If something else goes wrong on the server, returns an error with the json:
   `{ success: false,message: "An error occurred on the server. Try again later." }`

## User Create Account 
**Request Format:** /driphub/createuser

**Request Type:** POST

**Returned Data Format**: Text

**Description:** Returns text of whether the create user operation was successful or not

**Example Request:** /driphub/createuser

**Example Response:**
```
 "Created User"
```

**Error Handling:**
- Possible 400 errors (text):
  - If something goes wrong with user parameters, returns with the message:
  `Missing one or more of the required parameters.`
- Possible 500 errors (text):
  - If something else goes wrong on the server, returns an error with the message:
   `An error occurred on the server. Try again later.`
