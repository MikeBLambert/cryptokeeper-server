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
        return Promise.all([
            dropCollection('users'),
            dropCollection('transactions')
        ]
        );
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

    it('creates a transaction', () => {
        
        let newTransaction = {
            user: createdUsers[0]._id,            
            action: 'buy',
            currency: 'LTC',
            market: 'Fake Market',
            price: 5000,
            quantity: 12
        };

        return request(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(newTransaction)
            .then(result => {
                expect(result.body).toEqual({ ...newTransaction, user: newTransaction.user.toString(), _id: expect.any(String), time: expect.any(String) });
            });
    });

});
