const { dropCollection } = require('../util/db');
const User = require('../../lib/models/User');
const app = require('../../lib/app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const Chance = require('chance');
const chance = new Chance();

const checkStatus = statusCode => res => {
    expect(res.status).toEqual(statusCode);
};

const checkOk = res => checkStatus(200)(res);

const withToken = user => {
    return request(app)
        .post('/auth/signin')
        .send({ email: `${user.email}`, clearPassword: `${user.clearPassword}` })
        .then(({ body }) => body.token);
};

describe('account routes', () => {
    const users = Array.apply(null, { length: 1 })
        .map(() => ({ name: chance.name(), clearPassword: chance.word(), email: chance.email() }));

    let createdUsers;

    const createUser = user => {
        return User.create(user);
    };

    beforeEach(() => {
        return dropCollection('users');
    });

    beforeEach(() => {
        return Promise.all(users.map(createUser))
            .then(cs => {
                createdUsers = cs;
            });
    });

    let token;
    beforeEach(() => {
        return withToken(users[0]).then(createdToken => {
            token = createdToken;
        });
    });

    it('creates an account for an authorized user', () => {
        account = {
            exchange: 'Fake Market',
        }

        return request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)
            .send(account)
            .then(res => {
                checkOk(res);
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

        return request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)
            .send(account)
            .then(() => {
                request(app)
                    .post('/accounts/holdings')
                    .set('Authorization', `Bearer ${token}`)
                    .send(holding)
                    .then(res => {
                        checkOk(res);
                        expect(res.body).toEqual({
                            _id: expect.any(String),
                            user: createdUsers[0]._id.toString(),
                            exchange: account.exchange,
                            currencies: [holding]
                        });
                    });
            });
    });
});
