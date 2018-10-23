const router = require('express').Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');


module.exports = router
    .post('/', (req, res, next) => {
        const user = req.user._id;
        const { action, currency, exchange, price, quantity } = req.body;

        const transaction = Transaction.create({ 
            user, 
            action, 
            currency, 
            exchange, 
            price, 
            quantity 
        });

        const account = Account.findOneAndUpdate(
            { user: user, 'currencies.name': currency }, 
            { '$inc': { 'currencies.$.quantity': quantity } },
            { new: true }
        );

        Promise.all([transaction, account])
            .then(([transaction]) => {
                res.json(transaction);
            })
            .catch(err => {
                // some roll back logic here - time travel
                next(err);
            });
    });
