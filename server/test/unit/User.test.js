const User = require('../../lib/models/User');
const { getErrors } = require('./helpers');

describe('User model', () => {
    it('validates a good model', () => {
        
        const userData = {
            name: 'Richy Rich',
            email: 'makemoney@gmail.com'
        };

        const user = new User(userData);
        const jsonUser = user.toJSON();
        expect(jsonUser).toEqual({ ...userData, _id: expect.any(Object) });
    });

    it('requires a name and email', () => {
        
        const userData = {
            name: '',
            email: ''
        }; 

        const user = new User(userData);
        const errors = getErrors(user.validateSync(), 2);
        expect(errors.name.properties.message).toEqual('Path `name` is required.');
        expect(errors.email.properties.message).toEqual('Path `email` is required.');


    });
});
