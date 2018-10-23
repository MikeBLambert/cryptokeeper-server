const request = require('superagent');
const apiKey = process.env.COIN_MARKET_CAP_KEY;

const EXPIRED_AFTER = 1000 * 60;
const cache = {};

const getCachedData = () => {
    const cacheAge = new Date() - cache.created;
    if(cacheAge > EXPIRED_AFTER) return null;
    return cache.data;
};

const setCachedData = data => {
    cache.data = data;
    cache.created = new Date();
};

function getPrices(req, res, next) {


    const data = getCachedData();
    if(data) return data;

    return request.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest')
        .set({
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json;charset=UTF-8'
        })
        .query({
            start: 1,
            limit: 5000,
            convert: 'USD'
        })
        .type('json')
        .then(coinInfo => {
            setCachedData(coinInfo);
            req.coinInfo = coinInfo;
            next();
        })
        .catch(error => {
            console.log(error);
        });


}

module.exports = {
    getPrices
};
