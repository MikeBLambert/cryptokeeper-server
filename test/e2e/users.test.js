require('dotenv').config();
const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');
const mongoose = require('mongoose');


jest.mock('../../lib/streamer/api-watcher');


describe('accounts and holdingz', () => {

    const userTemplates = applyUsers(1);
    let createdUsers;
    let createdTokens;

    beforeEach(async() => {
        await Promise.all([
            dropCollection('users'),
            dropCollection('accounts'),
        ]);
        await Promise.all(userTemplates.map(signUp))
            .then(cs => createdUsers = cs);
        await Promise.all(userTemplates.map(signIn))
            .then(cs => createdTokens = cs);
    });

    it('creates an account for an authorized user', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({
                    _id: expect.any(String),
                    user: createdUsers[0]._id.toString(),
                    exchange: account.exchange,
                    currencies: []
                });
            });
    });

    it('does not create an account if there is already an account made for a user in that marketplace', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        const account2 = {
            exchange: 'Fake Market',
        };

        await request(app)
            .post('/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account2)
            .then(res => {
                expect(res.status).toEqual(403);
                expect(res.body).toEqual({ 'error': 'Users may have only one account per marketplace' });
            });
    });

    it('adds holding for an authorized user', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        const holding = {
            name: 'BTC',
            quantity: chance.natural()
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/api/users/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(holding)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({
                    _id: expect.any(String),
                    user: createdUsers[0]._id.toString(),
                    exchange: account.exchange,
                    currencies: [{
                        ...holding,
                        _id: expect.any(String)
                    }]
                });
            });
    });

    it('increments the value of a holding', async() => {

        const account = {
            exchange: 'Fake Market',
        };

        const holding = {
            name: 'BTC',
            quantity: 4
        };

        const change = {
            name: 'BTC',
            quantity: 2
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/api/users/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(holding);
        await request(app)
            .put('/api/users/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(change)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({
                    _id: expect.any(String),
                    user: createdUsers[0]._id.toString(),
                    exchange: account.exchange,
                    currencies: [{
                        _id: expect.any(String),
                        name: holding.name,
                        quantity: holding.quantity + change.quantity
                    }]
                });
            });
    });

    it('gets an account for an authorized user', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        const holding = {
            name: 'BTC',
            quantity: chance.natural()
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/api/users/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(holding);
        await request(app)
            .get('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({

                    exchange: account.exchange,
                    currencies: [{
                        ...holding,
                    }]
                });
            });
    });

    
    it('gets an account total for a particular user', async() => {
        
        const account = {
            exchange: 'Fake Market',
        };
    
        const holding = {
            name: 'BTC',
            quantity: 2
        };
    
        const holding2 = {
            name: 'BTC',
            quantity: 5
        };

        await request(app)
            .post('/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/users/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(holding);
        await request(app)
            .post('/users/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(holding2);
        await request(app)
            .get('/users/accounts/total')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual(expect.any(Number));
            });

        
    });

});

describe('transactions', () => {
    

    const users = applyUsers(1);
    let createdUsers;
    let createdAccounts;
    let createdToken;


    beforeEach(async() => {
        await Promise.all([
            dropCollection('users'),
            dropCollection('accounts'),
            dropCollection('transactions')
        ]);
        await Promise.all(users.map(signUp))
            .then(cs => createdUsers = cs);
        await signIn(users[0])
            .then(token => createdToken = token);

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
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdToken}`)
            .send(accountData);

        await request(app)
            .post('/api/users/accounts/holdings')
            .set('Authorization', `Bearer ${createdToken}`)
            .send(holdingsData);

        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdToken}`)
            .send(transactionData);
    });

    it('creates a transaction', async() => {

        let newTransaction = {
            action: 'buy',
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: chance.natural()
        };

        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdToken}`)            
            .send(newTransaction)
            .then(res => {
                // checkStatus(200)(res);
                expect(res.body).toEqual({ 
                    ...newTransaction,
                    _id: expect.any(String),
                    user: createdUsers[0]._id.toString(),
                    time: expect.any(String)
                });
            });
    });

    it('gets a transaction by user id', async() => {

        await request(app)
            .get('/api/users/transactions/anyid')
            .set('Authorization', `Bearer ${createdToken}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({
                    action: 'buy',
                    currency: 'BTC',
                    exchange: 'Fake Market',
                    price: expect.any(Number),
                    quantity: expect.any(Number),
                    time: expect.any(String)
                });
            });
    });



});

