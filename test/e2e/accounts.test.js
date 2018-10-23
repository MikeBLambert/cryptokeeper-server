const { dropCollection } = require('../util/db');
const User = require('../../lib/models/User');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { checkStatus } = require('../util/helpers');


// const users = Array.apply(null, { length: 1 })
//     .map(() => ({ name: chance.name(), clearPassword: chance.word(), email: chance.email() }));

// const signUp = user => User.create(user);

// const signIn = user => {
//     return request(app)
//         .post('/auth/signin')
//         .send({ email: `${user.email}`, clearPassword: `${user.clearPassword}` })
//         .then(({ body }) => body.token);
// };

// describe('account routes', () => {
    
//     let createdUsers;
//     let token;

//     beforeEach(() => {
//         return (async() => {
//             await Promise.all([dropCollection('users'), dropCollection('accounts')]);
//             await Promise.all(users.map(signUp))
//                 .then(cs => createdUsers = cs);
//             await signIn(users[0])
//                 .then(createdToken => token = createdToken);
//         })();
//     });


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
        const account = {
            exchange: 'Fake Market',
        };

        const holding = {
            name: 'BTC',
            quantity: 4
        };

        return (async() => {
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
        };

        return (async() => {
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
                });
            
        })();

    });
});
