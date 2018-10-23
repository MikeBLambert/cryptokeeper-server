require('dotenv').config();
const { getPrices } = require('../../../lib/exchanges/coin-market-cap');

describe('exchange API', () => {
    it('returns prices for bitcoin', done => {
        let req = {};

        let called = false;
        let error;
        const next = err => {
            called = true;
            error = err;
            
            expect(called).toBeTruthy();
            expect(error).toBeUndefined();
            expect(req.marketData).toEqual(expect.any(Object));
            done();
        };
        getPrices(req, null, next);
    });


});
