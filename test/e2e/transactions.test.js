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


describe('transaction routes', () => {
    
    beforeEach(() => {
        return Promise.all([
            dropCollection('users'),
            dropCollection('transactions')
        ]
        );
    });
    
    const users = Array.apply(null, { length: 1 })
        .map(() => ({ name: chance.name(), clearPassword: chance.word(), email: chance.email() }));

    let createdUsers;

    const createUser = user => {
        return User.create(user);
    };

    // const createAccount = account => {
    //     return request(app)
    //         .post('/accounts')
    //         .send(account)
    //         .then(res => res.body);
    // };

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

    beforeEach(() => {
        let newAccount = {
            user: createdUsers[0]._id,
            exchange: 'Fake Market',
            currencies: [{
                name: 'BTC', quantity: 2
            }]
        };
        return request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)            
            .send(newAccount);
    });

    it('creates a transaction', () => {
        
        let newTransaction = {
            action: 'buy',
            currency: 'BTC',
            exchange: 'Fake Market',
            price: 6500,
            quantity: 13
        };

        return request(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${token}`)            
            .send(newTransaction)
            .then(result => {
                checkOk(result);
                expect(result.body).toEqual({ 
                    ...newTransaction,
                    _id: expect.any(String),
                    user: createdUsers[0]._id.toString(),
                    time: expect.any(String)
                });

            });
    });

});
