const getErrors = (validation, numberExpected) => {
    expect(validation).toBeDefined();
    const errors = validation.errors;
    expect(Object.keys(errors)).toHaveLength(numberExpected);
    return errors;
};

class ResourceHelper {
    constructor() {
        this.users, this.createdUsers = [];
    }

    init(resource, length) {
        this[resource] = Array.apply(null, { length: length }).map(() => this.template(`${resource}`));
    }

    template(resource) {

        const templates = {
            users: {
                name: chance.name(),
                email: chance.email(),
                clearPassword: chance.string({ length: 10 })
            }
        };
        return templates[resource];
    }

    task(resource, data) {
        const routes = {

            users: '/users'
        };
        const route = routes[resource];
        return request(app)
            .post(route)
            .send(data)
            .then(res => res.body);
    }
    taskRunner(resource) {
        return Promise.all(this[resource].map(item => this.task(resource, item)))
            .then(response => this['created' + resource.replace(/^\w/, c => c.toUpperCase())] = response);
    }

    async wrapper(resource, number) {
        await dropCollection(resource);
        await this.init(resource, number);
        await this.taskRunner(resource);
    }

    assign(collection, source, link) {
        this[collection].forEach((item, index) => {
            item[link] = this[source][index % 2]._id;
        });
    }
}

module.exports = {
    getErrors,
    ResourceHelper
};
