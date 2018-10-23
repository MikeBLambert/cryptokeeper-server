const { dropCollection } = require('../util/db');
const User = require('../../lib/models/User');
const app = require('../../lib/app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');



describe('account routes', () => {
    
    const users = applyUsers();
    let createdUsers;
    let token;

    beforeEach(() => {
        return (async () => {
            await Promise.all([dropCollection('users'), dropCollection('accounts')]);
            await Promise.all(users.map(signUp))
                .then(cs => createdUsers = cs);
            await signIn(users[0])
                .then(createdToken => token = createdToken);
        })();
    });

    it('creates an account for an authorized user', () => {
        const account = {
            exchange: 'Fake Market',
        };

        return request(app)
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

    it('adds holding for an authorized user', () => {
        account = {
            exchange: 'Fake Market',
        }

        holding = {
            name: 'BTC',
            quantity: 4
        }

        return (async () => {
            await request(app)
                .post('/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send(account)
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
                        currencies: [holding]
                    });
                });
        })();
    });

    it('increments the value of a holding', () => {

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
        }

        return (async () => {
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
                .send(holding)
                .then(res => {
                    checkStatus(200)(res);
                    expect(res.body).toEqual({
                        _id: expect.any(String),
                        user: createdUsers[0]._id.toString(),
                        exchange: account.exchange,
                        currencies: [{
                            name: holding.name,
                            quantity: change.quantity
                        }]
                    });
                })
            
        })();

    });
});
