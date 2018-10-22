const getPrices = require('../../../lib/util/market-api');

describe('market API', () => {
    it('returns market info for bitcoin', () => {
        // const BTC = 1;
        let req = {};
        //  { body: { coin: `${BTC}` } };

        let called = false;
        let error;
        const next = err => {
            called = true;
            error = err;
            
            expect(called).toBeTruthy();
            expect(error).toBeUndefined();
            expect(req.coinInfo).toEqual('di');
        };
        getPrices(req, null, next);
    });

    // it('returns an error if passed')
});
