require('dotenv').config();
const { getPrices } = require('../../../lib/exchanges/coin-market-cap');
const { dropCollection } = require('../../util/db');
const app = require('../../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../../util/helpers');

describe('get total USD', () => {
    const users = applyUsers(1);
    let createdUsers;
    let createdAccounts;
    let token;

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

        let holdingsData = { name: 'BTC', quantity: 12 };

        let transactionData = {       
            action: 'buy',
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: chance.natural()
        };

        await request(app)
            .post('/users/accounts')
            .set('Authorization', `Bearer ${token}`)            
            .send(accountData);

        await request(app)
            .post('/users/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)            
            .send(holdingsData);
        
        await request(app)
            .post('/users/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(transactionData);
    });

    it('takes a user id and market data and returns total value of currencies in USD', () => {
        // expect(createdUsers).toEqual('dkjfdsh');
        expect(createdAccounts).toEqual('weeeeeew');
        

    });
});