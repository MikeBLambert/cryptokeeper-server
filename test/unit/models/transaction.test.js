const Transaction = require('../../../lib/models/Transaction');
// const { getErrors } = require('../../util/helpers');
const { Types } = require('mongoose');

describe('transaction model', () => {
    it('validates a good model', () => {
        const data = {
            user: Types.ObjectId(),
            action: 'sell',
            currency: 'BTC',
            market: 'Fake Market',
            price: 5,
            quantity: 6
        };
        const transaction = new Transaction(data);
        const jsonTransaction = transaction.toJSON();
        expect(jsonTransaction).toEqual({ ...data, time: expect.any(Date), _id: expect.any(Object) });
    });
});
