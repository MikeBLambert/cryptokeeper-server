const router = require('express').Router();
const Account = require('../models/Account');

// const ensureAuth = require('../util/ensure-auth')

module.exports = router
    .post('/', (req, res, next) => {
        const { exchange } = req.body;
        Account.create({
            user: req.user._id,
            exchange: exchange
        })
        .then(account => res.json(account))
        .catch(next);
    })
    .post('/holdings', (req, res, next) => {
        const { id } = req.params;
        Account.findByIdAndUpdate(
            req.user._id,
            { $push: { currency: req.body } },
            updateOptions)
            .then(account => res.json(account))
            .catch(next);
    });

