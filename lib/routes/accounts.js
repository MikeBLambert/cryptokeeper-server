const router = require('express').Router();
const Account = require('../models/Account');

// const ensureAuth = require('../util/ensure-auth')

const updateOptions = {
    new: true,
    runValidators: true
};

module.exports = router
    .post('/', (req, res, next) => {
        const { _id } = req.user;
        const { exchange } = req.body;
        Account.create({
            user: _id,
            exchange: exchange
        })
            .then(account => res.json(account))
            .catch(next);
    })
    .post('/holdings', (req, res, next) => {
        const holding = req.body;
        const { _id } = req.user;
        Account.findOneAndUpdate(
            { user: _id },
            { $push: { currencies: holding } },
            updateOptions)
            .then(account => res.json(account))
            .catch(next);
    })
    .put('/holdings', (req, res, next) => {
        const { quantity, name } = req.body;
        const { _id } = req.user;
        Account.findOneAndUpdate(
            { 'user': _id, 'currencies.name': name },
            { '$inc': { 'currencies.$.quantity': quantity } },
            updateOptions)
            .then(account => res.json(account))
            .catch(next);
    });
