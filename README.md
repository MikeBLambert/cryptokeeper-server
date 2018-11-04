# Cryptotraditron 9000

### A multi-user cryptocurrency trading simulation, October 26, 2018

##### By _**Definitely Not Robots (AKA: Claire Flanagan, Mike Lambert, and Jack Toumey)**_

## Description
_Using real-time market pricing, this simulation allows users to buy and sell the world's top 10 cryptocurrencies (by market capitalization) and compete for status as the top trader._

## Setup/Installation Requirements
* _Download/Clone repository from Github_
* _Use "npm i" command to install all dependencies_
* _See .env-example file for configuration details_
* _See package.json for script commands_

## Routes

| ROUTE | TYPE | SEND | RECEIVE |
| ----- | ---- | ---- | ------- |
| /api/auth/signup | POST | `{ name, email, password }` | `{ user: { name, email }, token: <bcrypt'd hash> }` |
| /api/auth/signin | POST | `{ email, password }` | `{ user: { name, email }, token: <bcrypt'd hash> }` |
| /api/auth/signin | POST | `{ email, password }` | `{ user: { name, email, roles: [] }, token: <bcrypt'd hash> }` |
| /api/prices | GET | `{ token: <bcrypt'd hash> }` | `{ <currency-symbol>: { price, rank, updated }` 
| /api/users/accounts | GET | `{ token: <bcrypt'd hash> }` | `{ exchange: { currencies: [{ name, quantity }] } }` 
| /api/users/accounts | POST | `{ token: <bcrypt'd hash> }, { exchange }` | `{ _id, user, exchange, currencies: [] } }` 
| /api/users/accounts/total | GET | `{ token: <bcrypt'd hash> }` | Total value of a user's holdings. `Number` 
| /api/users/transactions | POST | `{ token: <bcrypt'd hash> }`, `{ user, currency, exchange, quantity }` | `{ _id, user, time, exchange, currency, price }`
| /api/users/transactions | GET | `{ token: <bcrypt'd hash> }` | `{ time, exchange, currency, price }`  
| /api/leaderboard | GET | `{ token: <bcrypt'd hash> }` |List of top10 users as ranked by their asset holdings in USD. `{_id: currencies: [{ name, quantity }], accounts: { exchange, currencies: [ name, quantity ] }, user: [{ name, email, roles }]}` |

## Support and contact details
_Please feel free to contact any member of **Definitely Not Robots** via Github:_

_[Claire Flanagan](https://github.com/R-i-t-a)_

_[Mike Lambert](https://github.com/MikeBLambert)_

_[Jack Toumey](https://github.com/miloofcroton)_

## Technologies Used
_The server was built using Node's Express framework with test-driven-development assistance from Jest. The database was built using MongoDB and the Mongoose library. Real-time market data is supplied by [CoinMarketCap's API](https://pro.coinmarketcap.com/api/v1#section/Introduction)_

### License
*MIT*
Copyright (c) 2018 **_Claire Flanagan, Michael Lambert, and Jack Toumey_**



