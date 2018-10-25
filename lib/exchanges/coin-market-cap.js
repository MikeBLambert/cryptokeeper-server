const { getCurrentPrices } = require('../streamer/api-watcher');

function getPrices(req, res, next) {

    return getCurrentPrices()
        .then(marketData => {
            req.marketData = marketData;
            next();
        })
        .catch(error => next(error));
}

module.exports = {
    getPrices
};
