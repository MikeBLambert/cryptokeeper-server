const request = require('supertest');
const app = require('../../lib/app');

describe('users', () => {

    it('creates a user', () => {
        const newUser = {
            name: 'Mike',
            email: 'mike@mike.mike'
        };
        return request(app)
            .post('/auth/signup')
            .send(newUser)
            .then(res => {
                expect(res.body).toEqual({
                    ...newUser,
                    __v: expect.any(Number),
                    _id: expect.any(String)
                });
            });
    });
});
