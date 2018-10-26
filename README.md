# Cryptotraditron 9000

### A multi-user cryptocurrency trading simulation, October 26, 2018

##### By _** Definitely Not Robots (AKA: Claire Flanagan, Mike Lambert, and Jack Toumey)**_

## Description
_Using real-time market pricing, this simulation allows users to buy and sell the world's top 10 cryptocurrencies (by market capitalization) and compete for status as the top trader._

## Routes

| ROUTE | TYPE | SEND | RECEIVE |
|----------|:------:|------:| :---:|------:|
| /api/auth/signup | POST | `{ name, email, password }` | `{ user: { name, email }, token: <bcrypt'd hash> }` |
| /api/leaderboard | GET | `{ token: <bcrypt'd hash> }` |`List of users ranked` |



## Setup/Installation Requirements
* _This is a great place_
* _to list setup instructions_
* _in a simple_
* _easy-to-understand_
* _format_
_{Leave nothing to chance! You want it to be easy for potential users, employers and collaborators to run your app. Do I need to run a server? How should I set up my databases? Is there other code this app depends on?}_

## Known Bugs
_{Are there issues that have not yet been resolved that you want to let users know you know?  Outline any issues that would impact use of your application.  Share any workarounds that are in place. }_

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



