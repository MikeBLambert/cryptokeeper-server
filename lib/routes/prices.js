const router = require('express').Router();
const { getPrices } = require('../exchanges/coin-market-cap');

module.exports = router
    .get('/', getPrices, (req, res, next) => {
        res.json(req.marketData);
        next();
    });
