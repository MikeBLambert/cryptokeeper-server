require('dotenv').config();
const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');

jest.mock('../../lib/streamer/api-watcher');


describe('accounts and holdings', () => {

    const userTemplates = applyUsers(10);
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
            exchange: 'Make Farket',
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
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account2)
            .then(res => {
                expect(res.status).toEqual(403);
                expect(res.body).toEqual({ 'error': 'Users may have only one account per marketplace' });
            });
    });

    it('creates a holding, increments its value, and decrements value in USD', async() => {

        const account = {
            exchange: 'Fake Market',
        };

        const transaction = {
            user: createdUsers[0]._id,
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: 4
        };

        const change = {
            user: createdUsers[0]._id,
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: 2
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(transaction);
        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(change);
        await request(app)
            .get('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body.currencies[0].quantity).toBeLessThan(10000000);
                expect(res.body).toEqual({
                    exchange: account.exchange,
                    currencies: [{
                        name: 'USD',
                        quantity: expect.any(Number)
                    }, {
                        name: 'BTC',
                        quantity: transaction.quantity + change.quantity
                    }]
                });
            });
    });

    it('gets an account for an authorized user', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        const transaction = {
            user: createdUsers[0]._id,
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: chance.natural({ min: 1, max: 12 })
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(transaction);
        await request(app)
            .get('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({
                    exchange: account.exchange,
                    currencies: [{ name: 'USD', quantity: expect.any(Number) }, 
                        { name: transaction.currency, quantity: transaction.quantity }]
                });
            });
    });
    
    it('gets an account total for a particular user', async() => {
        
        const account = {
            exchange: 'Fake Market',
        };
    
        const transaction1 = {
            user: createdUsers[0]._id,
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: chance.natural({ min: 1, max: 12 })
        };
    
        const transaction2 = {
            user: createdUsers[0]._id,
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: chance.natural({ min: 1, max: 12 })
        };

        await request(app)
            .post('/api/users/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(transaction1);
        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(transaction2);
        await request(app)
            .get('/api/users/accounts/total')
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

        let transactionData = {
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
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdToken}`)
            .send(transactionData);

        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdToken}`)
            .send(transactionData);
    });

    it('creates a transaction', async() => {

        let newTransaction = {
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: chance.natural({ min: 1, max: 15 })
        };

        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdToken}`)            
            .send(newTransaction)
            .then(res => {
                checkStatus(200)(res);
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
            .get('/api/users/transactions')
            .set('Authorization', `Bearer ${createdToken}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({
                    currency: 'BTC',
                    exchange: 'Fake Market',
                    price: expect.any(Number),
                    quantity: expect.any(Number),
                    time: expect.any(String)
                });
            });
    });

    it('does not allow transactions if insufficient funds', async() => {
        
        let newTransaction = {
            currency: 'BTC',
            exchange: 'Fake Market',
            price: chance.natural(),
            quantity: 50000000
        };

        await request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${createdToken}`)            
            .send(newTransaction)
            .then(res => {
                expect(res.status).toEqual(403);
                expect(res.body).toEqual({ 'error': 'Insufficient funds' });
            });
    });
});

