require('dotenv').config();

const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');


describe('leaderboard', () => {

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


    it('getting the top 10 accounts returns 10 accounts', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        await Promise.all(createdTokens.map((token) => {
            return request(app)
                .post('/users/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send(account);
        }));

        await Promise.all(createdTokens.map((token) => {
            const holding = {
                name: 'BTC',
                quantity: chance.natural()
            };
            return request(app)
                .post('/users/accounts/holdings')
                .set('Authorization', `Bearer ${token}`)
                .send(holding);
        }));

        await request(app)
            .get('/leaderboard')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toHaveLength(10);

            });
    });

    it('getting the top 10 accounts by account value returns the top 10 by market value', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        let createdAccounts;

        await Promise.all(createdTokens.map((token) => {
            return request(app)
                .post('/users/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send(account);
        }));

        await Promise.all(createdTokens.map((token) => {
            const holding = {
                name: 'BTC',
                quantity: chance.natural()
            };
            return request(app)
                .post('/users/accounts/holdings')
                .set('Authorization', `Bearer ${token}`)
                .send(holding);
        }))
            .then(cs => createdAccounts = cs);

        // set variable here that calls in middleware/util that defines current market value of an account:

        // const topTen = createdAccounts.sort((a, b) => {
        //     // a.reduce
        // });

        await request(app)
            .get('/leaderboard')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
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
