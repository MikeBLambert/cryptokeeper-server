const router = require('express').Router();
const Transaction = require('../models/Transaction');

module.exports = router
    .post('/', (req, res, next) => {
        console.log('YYYYY', req.user._id)
        const { user, action, currency, market, price, quantity } = req.body;
        Transaction.create({ user, action, currency, market, price, quantity })
            .then(transaction => res.json(transaction))
            .catch(next);
    });