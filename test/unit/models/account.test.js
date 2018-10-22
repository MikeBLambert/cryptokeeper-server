const Account = require('../../../lib/models/Account');
const { getErrors } = require('../../util/helpers');
const { Types } = require('mongoose');

describe('account model', () => {
    it('validates a good model', () => {
        const data = {
            user: Types.ObjectId(),
            currencies: [{
                name: 'BTC',
                quantity: 5
            }]
        };
        const account = new Account(data);
        const jsonAccount = account.toJSON();
        expect(jsonAccount).toEqual({ ...data, _id: expect.any(Object) });
    });

    it('requires user, currency name, and currency quantity', () => {
        const data = {
            currencies: [{ }]
        };

        const account = new Account(data);
        const errors = getErrors(account.validateSync(), 2);

        expect(errors.user.properties.message).toEqual('Path `user` is required.');
        expect(errors['currencies.0.name'].properties.message).toEqual('Path `name` is required.');
    });
});
