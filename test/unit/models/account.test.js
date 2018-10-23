const Account = require('../../../lib/models/Account');
const { getErrors } = require('../../util/helpers');
const { Types } = require('mongoose');

describe('account model', () => {
    it('validates a good model', () => {
        const data = {
            user: Types.ObjectId(),
            exchange: 'Fake Market',
        };
        const account = new Account(data);
        const jsonAccount = account.toJSON();
        expect(jsonAccount).toEqual({ 
            _id: expect.any(Object),
            user: data.user,
            exchange: data.exchange,
            currencies: []
        });
    });

    it('requires user and market', () => {

        const account = new Account({});
        const errors = getErrors(account.validateSync(), 2);

        expect(errors.user.properties.message).toEqual('Path `user` is required.');
        expect(errors.exchange.properties.message).toEqual('Path `exchange` is required.');
        // expect(errors['currencies.0.name'].properties.message).toEqual('Path `name` is required.');
    });
});
