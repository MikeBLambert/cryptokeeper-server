require('dotenv').config();
const { checkStatus, signUp, signIn, applyUsers } = require('../util/helpers');
const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');

jest.mock('../../lib/streamer/api-watcher');

describe('price index', () => {

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

    it('gets the top 10 coins by market value and returns it (from our caching utility)', async() => {

        await request(app)
            .get('/api/prices')
            .set('Authorization', `Bearer ${createdTokens[0]}`)
            .then(res => {
                checkStatus(200)(res);
                expect(res.body).toBeInstanceOf(Object);
                expect(Object.keys(res.body)).toHaveLength(10);
                expect(res.body).toHaveProperty('BTC');
            });
    });

});
