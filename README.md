# Cryptokeeper

## Tasks

1. finish 'get top 10'
1. do 'get transactions for user'
1. get data showing up on the front end
1. deploy to heroku
1. complete view componenets
1. fix contingency logic in put transactions
1. add more exchanges
1. add more coins
1. make stuff fancier
1. add a bot

## App requirements:

### Routes

* ~~post /accounts~~
* ~~post /transactions~~
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


### Docs to reference

* we are using this API for market data: https://pro.coinmarketcap.com/api/v1#section/Introduction
