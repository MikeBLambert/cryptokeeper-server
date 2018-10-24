const router = require('express').Router();
const Account = require('../models/Account');
const { getPrices } = require('../exchanges/coin-market-cap');

module.exports = router
    .get('/', getPrices, (req, res, next) => {
        Account.find()
            .limit(10)
            .sort('-currencies[0].quantity')
            .select({ 'user': false, '_id': false, 'currencies._id': false })
            .then(accounts => res.json(accounts))
            .catch(next);
    });
