const Account = require('../../../lib/models/Account');
const { getErrors } = require('../../util/helpers');
const { Types } = require('mongoose');

describe('account model', () => {
    it('validates a good model', () => {
        const data  = {
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
});
