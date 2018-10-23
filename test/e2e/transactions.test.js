const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');


const users = applyUsers();


describe('transaction routes', () => {
        
    let createdUsers;
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
        let newAccount = {
            user: createdUsers[0]._id,
            exchange: 'Fake Market',
        };
        await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)            
            .send(newAccount);
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
            .post('/transactions')
            .set('Authorization', `Bearer ${token}`)            
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



});
