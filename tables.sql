CREATE TABLE "listings" (
	"id"	INTEGER NOT NULL,
	"listingName"	TEXT,
	"listingImage"	TEXT,
	"seller"	TEXT,
	"price"	REAL,
	"type"	TEXT,
	"stock", INTEGER
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "transactions" (
	"transID"	INTEGER,
	"buyer"	TEXT,
	"listingID"	INTEGER,
	"timePurchased"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"confirmationId"	TEXT,
	FOREIGN KEY("listingID") REFERENCES "listings"("id"),
	PRIMARY KEY("transID" AUTOINCREMENT)
);

CREATE TABLE "users" (
	"username"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"email"     TEXT NOT NULL,
	PRIMARY KEY("username")
);