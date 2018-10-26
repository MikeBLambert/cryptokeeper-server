const router = require('express').Router();
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { getPrices } = require('../exchanges/coin-market-cap');
const { getTotalInUSD } = require('../util/get-USD');
const { HttpError } = require('../util/errors');

const updateOptions = {
    new: true,
    runValidators: true
};

module.exports = router
    .post('/accounts', (req, res, next) => {
        const { _id } = req.user;
        const { exchange } = req.body;
        Account.find({ user: _id })
            .select({ 'exchange': true })
            .then(existing => {
                const duplicates = existing.filter(acct => {
                    return exchange === acct.exchange;
                });
                if(duplicates.length === 0) {
                    Account.create({
                        user: _id,
                        exchange: exchange
                    })
                        .then(account => res.json(account))
                        .catch(next);
                }
                else {
                    next(new HttpError({
                        code: 403,
                        message: 'Users may have only one account per marketplace'
                    }));
                }
            });
    })

    .get('/accounts/total', getPrices, (req, res, next) => {
        const { _id } = req.user;
        const { marketData } = req;

        Account.findOne({ user: _id })
            .then(account => {
                const acctTotal = account.accountTotal(marketData);
                res.json(acctTotal);
            })
            .catch(next);
    })


    .get('/accounts', (req, res, next) => {
        const { _id } = req.user;

        // For this to be get all accounts, this will have to be find() not findOne. Only relevant when we have multiple markets and thus multiple accounts per user.

        Account.findOne({ 'user': _id })
            .select({ 'user': false, '_id': false, 'currencies._id': false })
            .then(account => res.json(account))
            .catch(next);
    })


    .post('/transactions', getPrices, (req, res, next) => {
        let marketData = req.marketData;
        const { action, currency, exchange, price, quantity } = req.body;
        const holding = { name: currency, quantity };
        const holdingInUSD = getTotalInUSD([holding], marketData);
        const { _id } = req.user;

        const transaction = Transaction.create({
            user: req.user,
            action,
            currency,
            exchange,
            price,
            quantity
        });

        const pushOrIncrementCurrency = () => {
            Account.find({ user: _id })
                .then(account => {
                    let currencyExists = 0;
                    for(let i = 0; i < account[0].currencies.length; i++) {
                        if(account[0].currencies[i].name === currency) {
                            currencyExists += 1;
                        }
                    }
                    if(currencyExists) {
                        return Account.findOneAndUpdate(
                            { 'user': _id, 'currencies.name': currency },
                            { $inc: { 'currencies.$.quantity': quantity } });
                    } else {
                        return Account.findOneAndUpdate(
                            { user: _id },
                            { $push: { currencies: holding } },
                            updateOptions
                        );
                    }
                });
        };

        const updateUSD = Account.findOneAndUpdate(
            { 'user': _id, 'currencies.name': 'USD' },
            { $inc: { 'currencies.$.quantity': -holdingInUSD } }
        );

        Promise.all([transaction, pushOrIncrementCurrency(), updateUSD])
            .then(([transaction]) => res.json(transaction))
            .catch(next);
    })

    .get('/transactions', (req, res, next) => {
        const { _id } = req.user;
        Transaction.findOne({ 'user': _id })
            .select({ 'user': false, '_id': false })
            .then(transaction => res.json(transaction))
            .catch(next);
    });
