const router = require('express').Router();
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

const updateOptions = {
    new: true,
    runValidators: true
};

module.exports = router
    .post('/accounts', (req, res, next) => {
        const { _id } = req.user;
        const { exchange } = req.body;
        Account.create({
            user: _id,
            exchange: exchange
        })
            .then(account => res.json(account))
            .catch(next);
    })

    .post('/accounts/holdings', (req, res, next) => {
        const holding = req.body;
        const { _id } = req.user;
        Account.findOneAndUpdate(
            { user: _id },
            { $push: { currencies: holding } },
            updateOptions)
            .then(account => res.json(account))
            .catch(next);
    })

    .put('/accounts/holdings', (req, res, next) => {
        const { quantity, name } = req.body;
        const { _id } = req.user;
        Account.findOneAndUpdate(
            { 'user': _id, 'currencies.name': name },
            { '$inc': { 'currencies.$.quantity': quantity } },
            updateOptions)
            .then(account => res.json(account))
            .catch(next);
    })

    .get('/accounts', (req, res, next) => {
        const { _id } = req.user;
        Account.findOne({ 'user': _id })
            .select({ 'user': false, '_id': false, 'currencies._id': false })
            .then(account => res.json(account))
            .catch(next);
    })

    .post('/transactions', (req, res, next) => {
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
    })

    .get('/transactions/:id', (req, res, next) => {
        const { _id } = req.user;
        Transaction.findOne({ 'user': _id })
            .select({ 'user': false, '_id': false })
            .then(transaction => res.json(transaction))
            .catch(next);
    });
