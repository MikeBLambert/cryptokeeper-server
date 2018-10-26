const Transaction = require('../../../lib/models/Transaction');
const { getErrors } = require('../../util/helpers');
const { Types } = require('mongoose');

describe('transaction model', () => {
    it('validates a good model', () => {
        const data = {
            user: Types.ObjectId(),
            currency: 'BTC',
            exchange: 'Fake Market',
            price: 5,
            quantity: 6
        };
        const transaction = new Transaction(data);
        const jsonTransaction = transaction.toJSON();
        expect(jsonTransaction).toEqual({ ...data, time: expect.any(Date), _id: expect.any(Object) });
    });

    it('requires user, action, currency, exchange, price, and quantity', () => {
        const data = {
            
        };

        const transaction = new Transaction(data);
        const errors = getErrors(transaction.validateSync(), 5);

        expect(errors.user.properties.message).toEqual('Path `user` is required.');
        expect(errors.currency.properties.message).toEqual('Path `currency` is required.');
        expect(errors.exchange.properties.message).toEqual('Path `exchange` is required.');
        expect(errors.price.properties.message).toEqual('Path `price` is required.');
        expect(errors.quantity.properties.message).toEqual('Path `quantity` is required.');
    });
});
