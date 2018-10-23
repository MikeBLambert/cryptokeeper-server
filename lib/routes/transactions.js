const router = require('express').Router();
const Transaction = require('../models/Transaction');

module.exports = router
    .post('/', (req, res, next) => {
        const user = req.user._id;
        const { action, currency, market, price, quantity } = req.body;
        Transaction.create({ 
            user, 
            action, 
            currency, 
            market, 
            price, 
            quantity 
        })
            .then(transaction => res.json(transaction))
            .catch(next);
    });
