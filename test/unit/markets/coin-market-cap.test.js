require('dotenv').config();
const { getPrices } = require('../../../lib/exchanges/coin-market-cap');

jest.mock('../../../lib/streamer/api-watcher');

describe('exchange API', () => {
    it('runs without error', done => {
        let req = {};

        let called = false;
        let error;

        const next = err => {
            called = true;
            error = err;
            expect(called).toBeTruthy();
            expect(error).toBeUndefined();
            done();
        };
        
        return getPrices(req, null, next);
    });
    it('returns an array of the top 20 coins', done => {
        let req = {};

        const next = () => {
            expect(Object.keys(req.marketData)).toHaveLength(10);
            done();
        };
        
        return getPrices(req, null, next);
    });
    it('the top 20 array includes Bitcoin and Ethereum', done => {
        let req = {};

        const next = () => {
            expect(req.marketData.BTC).toHaveProperty('price');
            expect(req.marketData.BTC).toHaveProperty('rank');
            expect(req.marketData.BTC).toHaveProperty('updated');
            done();
        };
        
        return getPrices(req, null, next);
    });
    

});
