const router = require('express').Router();
const User = require('../models/User');
const { getPrices } = require('../exchanges/coin-market-cap');

module.exports = router
    .get('/', getPrices, (req, res, next) => {
        const { topCount = 10 } = req.query;
        User.top(topCount, req.marketData)
            .then(accounts => res.json(accounts))
            .catch(next);
    });



