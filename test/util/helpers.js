const request = require('supertest');
const app = require('../../lib/app');
const Chance = require('chance');
const chance = new Chance();


const getErrors = (validation, numberExpected) => {
    expect(validation).toBeDefined();
    const errors = validation.errors;
    expect(Object.keys(errors)).toHaveLength(numberExpected);
    return errors;
};

const checkStatus = statusCode => res => {
    expect(res.body.error).toBeUndefined();
    expect(res.status).toEqual(statusCode);
};

const applyUsers = function(length) {
    return Array.apply(null, { length: length })
        .map(() => ({ name: chance.name(), clearPassword: chance.word(), email: chance.email() }));
};

const signUp = user => {
    return request(app)
        .post('/api/auth/signup')
        .send({ name: `${user.name}`, email: `${user.email}`, clearPassword: `${user.clearPassword}` })
        .then(({ body }) => body.user);
};
const signIn = user => {
    return request(app)
        .post('/api/auth/signin')
        .send({ email: `${user.email}`, clearPassword: `${user.clearPassword}` })
        .then(({ body }) => body.token);
};

module.exports = {
    getErrors,
    checkStatus,
    applyUsers,
    signUp,
    signIn,
};
