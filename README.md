# Cryptokeeper


## App requirements:

### Routes

* ~~post /accounts~~
* ~~post /accounts/holdings~~
* ~~put /accounts/holdings~~
* ~~post /transactions~~
    * all transactions should modify account holdings
* ~~get /accounts by id~~
* get /accounts for top 10 value
* get /transactions for user id

### Middleware

* check prices and define current market value of an account
    * used for 'get top 10' route

### Business logic requirements

* see account holdings
* see market prices
* initiate a transaction
* see account leaderboard

### UI requirements

|resource|component|
|--------|---------|
|account holdings (single)|table and/or line chart|
|market prices|table and/or line chart|
|transaction|form submission|
|account holdings (all)|table|
