require('dotenv').config();

const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');
const mongoose = require('mongoose');

jest.mock('../../lib/streamer/api-watcher');

describe('leaderboard', () => {

    const userTemplates = applyUsers(15);
    let createdTokens;

    beforeEach(async() => {
        await Promise.all([
            dropCollection('users'),
            dropCollection('accounts'),
        ]);
        await Promise.all(userTemplates.map(signUp));
        await Promise.all(userTemplates.map(signIn))
            .then(cs => createdTokens = cs);
    });

    afterAll(() => mongoose.disconnect());

    it('returns the top 10 users', async() => {
        const account = {
            exchange: 'Fake Market',
        };

        await Promise.all(createdTokens.map((token) => {
            return request(app)
                .post('/api/users/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send(account);
        }));

        await Promise.all(createdTokens.map((token) => {
            const transaction1 = {
                user: this._id,
                currency: 'BTC',
                exchange: 'Fake Market',
                price: chance.natural(),
                quantity: chance.natural({ min: 5, max: 15 })
            };
            return request(app)
                .post('/api/users/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send(transaction1);
        }));

        await Promise.all(createdTokens.map((token) => {
            const transaction2 = {
                user: this._id,
                currency: 'ETH',
                exchange: 'Fake Market',
                price: chance.natural(),
                quantity: chance.natural({ min: 5, max: 15 })
            };
            return request(app)
                .post('/api/users/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send(transaction2);
        }));

        await request(app)
            .get('/api/leaderboard')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toHaveLength(10);
                res.body.forEach(topUser => {
                    expect(topUser.user).toBeTruthy();
                    expect(topUser.usd).toEqual(expect.any(Number));
                    expect(topUser.accounts).toEqual(expect.any(Array));
                });
            });
    });
});
 




