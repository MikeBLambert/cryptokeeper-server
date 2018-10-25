require('dotenv').config();
const { getPrices } = require('../../../lib/exchanges/coin-market-cap');
const { getTotalInUSD, getSingleValueInUSD } = require('../../../lib/util/get-USD');
const { dropCollection } = require('../../util/db');
const app = require('../../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../../util/helpers');

describe('get total USD', () => {
    const users = applyUsers(1);
    let createdUsers;
    let createdToken;
    let token;

    let marketData = [
        {
            'quote': { 'USD': { 'price': 6499.33240876 } },
            'symbol': 'BTC'
        },
        {
            'quote': { 'USD': { 'price': 203.585469611 } }, 
            'symbol': 'ETH'
        }
    ];

    beforeEach(async() => {
        await Promise.all([
            dropCollection('users'),
            dropCollection('accounts'),
            dropCollection('transactions')
        ]);
        await Promise.all(users.map(signUp))
            .then(cs => createdUsers = cs);
        await signIn(users[0])
            .then(createdToken => token = createdToken);
    });

    beforeEach(async() => {
        let accountData = {
            user: createdUsers[0]._id,
            exchange: 'Fake Market',
        };

        let holdingsData1 = { name: 'BTC', quantity: 12 };
        let holdingsData2 = { name: 'ETH', quantity: 80 };

        let transactionData = {       
            action: 'buy',
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: 2
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${token}`)            
            .send(accountData);

        await request(app)
            .post('/api/users/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)            
            .send(holdingsData1);

        await request(app)
            .post('/api/users/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)            
            .send(holdingsData2);
        
        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(transactionData);
    });

    it('takes a user id and market data and returns total value of currencies in USD', () => {
        let userCurrencies;

        return request(app)
            .get('/api/users/accounts/anyid')
            .set('Authorization', `Bearer ${token}`) 
            .then(res => {
                userCurrencies = res.body.currencies;
                const totalCurrencies = getTotalInUSD(userCurrencies, marketData);
                expect(totalCurrencies).toEqual(expect.any(Number));
            });           
    });
});