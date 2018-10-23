const User = require('../../lib/models/User');
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
    expect(res.status).toEqual(statusCode);
};

const applyUsers = function() {
    return Array.apply(null, { length: 1 })
        .map(() => ({ name: chance.name(), clearPassword: chance.word(), email: chance.email() }));
};

const signUp = user => User.create(user);

const signIn = user => {
    return request(app)
        .post('/auth/signin')
        .send({ email: `${user.email}`, clearPassword: `${user.clearPassword}` })
        .then(({ body }) => body.token);
};

// class TestHelper {
//     constructor() {
//         this.users, this.createdUsers = [];
//         this.token;
//     }

//     init(resource, length) {
//         this[resource] = Array.apply(null, { length: length }).map(() => this.template(`${resource}`));
//     }

//     template(resource) {
//         const templates = {
//             users: {
//                 name: chance.name(),
//                 email: chance.email(),
//                 clearPassword: chance.string({ length: 10 })
//             }
//         };
//         return templates[resource];
//     }

//     task(resource, data) {
//         const routes = {
//             users: '/auth'
//         };
//         const route = routes[resource];
//         return request(app)
//             .post(route)
//             .send(data)
//             .then(res => res.body);
//     }
//     taskRunner(resource) {
//         return Promise.all(this[resource].map(item => this.task(resource, item)))
//             .then(response => this['created' + resource.replace(/^\w/, c => c.toUpperCase())] = response);
//     }

//     async wrapper(resource, number) {
//         await dropCollection(resource);
//         await this.init(resource, number);
//         await this.taskRunner(resource);
//     }

//     assign(collection, source, link) {
//         this[collection].forEach((item, index) => {
//             item[link] = this[source][index % 2]._id;
//         });
//     }
// }

module.exports = {
    getErrors,
    checkStatus,
    applyUsers,
    signUp,
    signIn,
    // TestHelper
};
