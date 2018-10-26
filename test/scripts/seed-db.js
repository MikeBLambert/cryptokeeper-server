// const { dropCollection } = require('../util/db');
const app = require('../../lib/app');
const request = require('supertest');
const Chance = require('chance');
const chance = new Chance();
const { signUp, signIn, applyUsers } = require('../util/helpers');
const mongoose = require('mongoose');

const connect = require('../../lib/util/connect');
connect('mongodb://localhost:27017/crypto');

let createdUsers;
let createdTokens = [];
let createdAccounts;

const users = applyUsers(1);
const account = {
    exchange: 'Fake Market',
};
const holding = {
    name: 'BTC',
    quantity: chance.natural()
};

const dropCollection = (name) => {
    mongoose.connection.dropCollection(name)
        .catch(err => {
            if(err.codeName !== 'NamespaceNotFound') throw err;
        });
};

(async() => {
    await Promise.all([
        dropCollection('users'),
        dropCollection('accounts')
    ]);

    await Promise.all(users.map(signUp))
        .then(cs => createdUsers = cs);
    await signIn(users[0])
        .then(token => createdTokens[0] = token);

    await request(app)
        .post('/api/users/accounts')
        .set('Authorization', `Bearer ${createdTokens[0]}`)
        .send(account);
    await request(app)
        .post('/api/users/transactions')
        .set('Authorization', `Bearer ${createdTokens[0]}`)
        .send(holding);
    await request(app)
        .get('/api/users/accounts')
        .set('Authorization', `Bearer ${createdTokens[0]}`)
        .then(({ body }) => createdAccounts = body);  
    
    await mongoose.disconnect();

    await console.table(createdUsers);
    await console.table(createdTokens);
    await console.table(createdAccounts);
    
    await console.log('test credentials', `email: ${users[0].email}`, `pass: ${users[0].clearPassword}`);
})();
    


