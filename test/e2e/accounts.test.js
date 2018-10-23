const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');


describe('account routes', () => {
    
    const userTemplates = applyUsers(15);
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
            .post('/accounts')
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
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/accounts/holdings')
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
            .post('/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(holding);
        await request(app)
            .put('/accounts/holdings')
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
            .post('/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(account);
        await request(app)
            .post('/accounts/holdings')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .send(holding);
        await request(app)
            .get('/accounts')
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


    it('gets the top 10 accounts by account value', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        let createdAccounts;

        await Promise.all(createdTokens.map((token) => {
            return request(app)
                .post('/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send(account);
        }));

        await Promise.all(createdTokens.map((token) => {
            const holding = {
                name: 'BTC',
                quantity: chance.natural()
            };
            return request(app)
                .post('/accounts/holdings')
                .set('Authorization', `Bearer ${token}`)
                .send(holding);
        }))
            .then(cs => createdAccounts = cs);

        // set variable here that calls in middleware/util that defines current market value of an account:

        // const topTen = createdAccounts.sort((a, b) => {
        //     // a.reduce
        // });

        await request(app)
            .get('/accounts')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toHaveLength(10);
                // expect(res.body).toEqual({
                //     _id: expect.any(String),
                //     user: createdUsers[0]._id.toString(),
                //     exchange: account.exchange,
                //     currencies: [{
                //         ...holding,
                //     }]
                // });
            });
    });
});
