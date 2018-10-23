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
        const currency = req.body;
        const { _id } = req.user;
        Account.findByIdAndUpdate(
            _id,
            { $push: { currency: currency } },
            updateOptions)
            .then(account => res.json(account))
            .catch(next);
    })
    .put('/holdings', (req, res, next) => {
        const { currency } = req.params;
        const { change } = req.body;
        const { _id } = req.user;
        Account.findOneAndUpdate(
            { '_id': _id, 'currencies.name': currency },
            { '$inc': { 'currencies.$.quantity': change } },
            updateOptions)
            .then(tour => res.json(tour))
            .catch(next);
    });
