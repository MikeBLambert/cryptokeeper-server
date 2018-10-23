const request = require('superagent');

const get = url => request.get(url).then(res => res.body);

function getPrices(req, res, next) {

    return get('http://api.coinmarketcap.com/v2/ticker')
        .then(coinInfo => {
            req.coinInfo = coinInfo;
            next();
        });

}

module.exports = {
    getPrices
};
