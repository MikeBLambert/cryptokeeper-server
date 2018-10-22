const request = require('superagent');
const { HttpError } = require('./errors');

const get = url => request.get(url).then(res => res.body);

module.exports = function getPrices(req, res, next) {

    const { coin } = req.body;

    if(coin) {
        return get(`http://api.coinmarketcap.com/v2/ticker/${coin}`)
            .then(coinInfo => {
                req.coinInfo = coinInfo;
                next();
            });
    } else {
        const httpError = new HttpError({
            code: 404,
            message: 'coin not found'
        });
        next(httpError);
    }
};
