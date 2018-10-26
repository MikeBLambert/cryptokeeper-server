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
let createdTokens;
let createdTransactions;

const users = applyUsers(15);

const transaction = {
    currency: 'BTC',
    exchange: 'Fake Market',
    price: chance.natural({ min: 1, max: 400 }),
    quantity: chance.natural({ min: 1, max: 400 })
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
        .then(cu => createdUsers = cu);

    await Promise.all(users.map(signIn))
        .then(tokens => createdTokens = tokens);


    await Promise.all(createdTokens.map((token) => {
        return request(app)
            .post('/api/users/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send(transaction)
            .then(({ body }) => body); 
    }))
        .then((transactions) => createdTransactions = transactions);

        
    await mongoose.disconnect();
        
    await console.table(createdUsers);
    await console.table(createdTokens);
    await console.table(createdTransactions);
        
    await console.log('test credentials', `email: ${users[0].email}`, `pass: ${users[0].clearPassword}`);
})();
    
// create more users, sign them all in, give each an account, and make them have varying account values
    
    
    
    
// await request(app)
//     .post('/api/users/accounts')
//     .set('Authorization', `Bearer ${createdTokens[0]}`)
//     .send(account);
// await request(app)
//      .post('/api/users/transactions')
//      .set('Authorization', `Bearer ${createdTokens[0]}`)
//      .send(transaction);
// await request(app)
//     .get('/api/users/accounts')
//     .set('Authorization', `Bearer ${createdTokens[0]}`)
//     .then(({ body }) => createdAccounts = body);  