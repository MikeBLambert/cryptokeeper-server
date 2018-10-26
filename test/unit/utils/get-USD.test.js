require('dotenv').config();
const { getTotalInUSD } = require('../../../lib/util/get-USD');
const { dropCollection } = require('../../util/db');
const app = require('../../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { signUp, signIn, applyUsers } = require('../../util/helpers');


jest.mock('../../../lib/streamer/api-watcher');


describe('get total USD', () => {
    const users = applyUsers(1);
    let createdUsers;
    let token;

    let marketData = {
        BTC: {
            price: 6499.33240876,
            rank: 1,
            updated: new Date().toISOString()
        },
        ETH: {
            price: 203.585469611,
            rank: 2,
            updated: new Date().toISOString()
        }
    };

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

        let transactionData1 = {       
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: 12
        };


        let transactionData2 = {       
            currency: 'ETH',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: 80
        };

        let transactionData3 = {       
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
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(transactionData1);

        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(transactionData2);
        
        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(transactionData3);
    });

    it('takes a user id and market data and returns total value of currencies in USD', () => {

        let userCurrencies;

        return request(app)
            .get('/api/users/accounts')
            .set('Authorization', `Bearer ${token}`) 
            .then(res => {
                userCurrencies = res.body.currencies;
                const totalCurrencies = getTotalInUSD(userCurrencies, marketData);
                expect(totalCurrencies).toEqual(expect.any(Number));
            });           
    });
});
