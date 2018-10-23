const router = require('express').Router();
const Transaction = require('../models/Transaction');

module.exports = router
    .post('/', (req, res, next) => {
        const user = req.user._id;
        const { action, currency, exchange, price, quantity } = req.body;
        Transaction.create({ 
            user, 
            action, 
            currency, 
            exchange, 
            price, 
            quantity 
        })
            .then(transaction => res.json(transaction))
            .catch(next);
    });
