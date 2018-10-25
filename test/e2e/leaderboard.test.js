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
            const holding1 = {
                name: 'BTC',
                quantity: chance.natural()
            };
            return request(app)
                .post('/api/users/accounts/holdings')
                .set('Authorization', `Bearer ${token}`)
                .send(holding1);
        }));

        await Promise.all(createdTokens.map((token) => {
            const holding2 = {
                name: 'ETH',
                quantity: chance.natural()
            };
            return request(app)
                .post('/api/users/accounts/holdings')
                .set('Authorization', `Bearer ${token}`)
                .send(holding2);
        }));

        await request(app)
            .get('/api/leaderboard')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toHaveLength(10);
                expect(res.body[0].usd).toBeGreaterThan(res.body[1].usd);
                res.body.forEach(topUser => {
                    expect(topUser.user).toBeTruthy();
                    expect(topUser.usd).toEqual(expect.any(Number));
                    expect(topUser.accounts).toEqual(expect.any(Array));
                });
            });
    });
});
 




