const { dropCollection } = require('../util/db');
const User = require('../../lib/models/User');
const app = require('../../lib/app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const Chance = require('chance');
const chance = new Chance();
const mongoose = require('mongoose');


const checkStatus = statusCode => res => {
    expect(res.status).toEqual(statusCode);
};

const checkOk = res => checkStatus(200)(res);

const withToken = user => {
    return request(app)
        .post('/api/auth/signin')
        .send({ email: `${user.email}`, clearPassword: `${user.clearPassword}` })
        .then(({ body }) => body.token);
};

describe('auth routes', () => {
    const users = Array.apply(null, { length: 1 })
        .map(() => ({ name: chance.name(), clearPassword: chance.word(), email: chance.email() }));

    let createdUsers;

    const createUser = user => {
        return User.create(user);
    };

    beforeEach(() => {
        return dropCollection('users');
    });

    afterAll(() => mongoose.disconnect());

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

    it('hashes a users password', () => {
        return User.create({
            name: 'ryan',
            clearPassword: 'testing1234',
            email: 'ryan@test.com'
        })
            .then(user => {
                expect(user.clearPassword).not.toEqual('testing1234');
                expect(bcrypt.compareSync('testing1234', user.passwordHash));
            });
    });

    it('creates a user on signup', () => {
        return request(app)
            .post('/api/auth/signup')
            .send({ name: 'ryan', email: 'ryan@ryan.com', clearPassword: 'testing1234' })
            .then(({ body: user }) => {
                // const user = res.body
                expect(user).toEqual({ 
                    user: {
                        _id: expect.any(String), 
                        name: 'ryan', 
                        email: 'ryan@ryan.com', 
                        roles: [] 
                    },
                    token: expect.any(String)
                });
            });
    });

    it('compares passwords', () => {
        const validPassword = users[0].clearPassword;
        const invalidPassword = `${validPassword}1234`;

        const validCompare = createdUsers[0].compare(validPassword);
        const invalidCompare = createdUsers[0].compare(invalidPassword);

        expect(validCompare).toBeTruthy();
        expect(invalidCompare).toBeFalsy();
    });

    it('signs in a user', () => {
        return request(app)
            .post('/api/auth/signin')
            .send({ email: createdUsers[0].email, clearPassword: users[0].clearPassword })
            .then(res => {
                checkOk(res);
                expect(res.body.token).toEqual(expect.any(String));
            });
    });

    it('rejects signing in a bad user', () => {
        return request(app)
            .post('/api/auth/signin')
            .send({ email: createdUsers[0].email, clearPassword: `${users[0].clearPassword}1234` })
            .then(checkStatus(401));
    });

    it('rejects signing in a user with bad email', () => {
        return request(app)
            .post('/api/auth/signin')
            .set('Authorization', `Bearer ${token}`)
            .send({ email: `${createdUsers[0].email}`, clearPassword: `${users[0].clearPassword}1234` })
            .then(checkStatus(401));
    });

    it('verifies a signed in user', () => {
        return withToken(users[0])
            .then(token => {
                return request(app)
                    .get('/api/auth/verify')
                    .set('Authorization', `Bearer ${token}`)
                    .then(res => {
                        expect(res.body).toEqual({ success: true });
                    });
            });

    });

    // it('creates an auth token', () => {
    //     return createdUsers[0].authToken()
    //         .then(token => {
    //             expect(token).toEqual(expect.any(String));
    //             return token;
    //         })
    //         .then(token => {
    //             return User.verifyToken(token).then(user => {
    //                 expect(user).toEqual({});
    //             });
    //         });
    // });
});
