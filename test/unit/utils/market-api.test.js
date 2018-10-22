const getPrices = require('../../../lib/util/market-api');

describe('market API', () => {
    it('returns market info for bitcoin', () => {
        const BTC = 1;
        const req = { body: { coin: `${BTC}` } };

        let called = false;
        let error;
        const next = err => {
            called = true;
            error = err;
            
            expect(called).toBeTruthy();
            expect(error).toBeUndefined();
            expect(req.coinInfo).toEqual(expect.any(Object));
        };
        getPrices(req, null, next);
    });
});
