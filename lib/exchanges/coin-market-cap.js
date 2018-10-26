const { getCurrentPrices } = require('../streamer/api-watcher');

function getPrices(req, res, next) {
    req.marketData = getCurrentPrices();
    next();
}

module.exports = {
    getPrices
};


