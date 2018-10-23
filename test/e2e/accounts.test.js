const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');

const users = applyUsers();

describe('account routes', () => {
    
    let createdUsers;
    let token;

    beforeEach(async() => {
        await Promise.all([
            dropCollection('users'), 
            dropCollection('accounts'),
        ]);
        await Promise.all(users.map(signUp))
            .then(cs => createdUsers = cs);
        await signIn(users[0])
            .then(createdToken => token = createdToken);
    });

    it('creates an account for an authorized user', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)
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

    it('adds holding for an authorized user', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        const holding = {
            name: 'BTC',
            quantity: chance.natural()
        };

        await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)
            .send(account);
        await request(app)
            .post('/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)
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
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)
            .send(account);
        await request(app)
            .post('/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)
            .send(holding);
        await request(app)
            .put('/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)
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
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)
            .send(account);
        await request(app)
            .post('/accounts/holdings')
            .set('Authorization', `Bearer ${token}`)
            .send(holding);
        await request(app)
            .get('/accounts')
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toEqual({
                    _id: expect.any(String),
                    user: createdUsers[0]._id.toString(),
                    exchange: account.exchange,
                    currencies: [{
                        ...holding,
                    }]
                });
            });
    });
});
