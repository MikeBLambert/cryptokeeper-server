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
        Account.findOne({ 'user': _id })
            .select({ 'user': false, '_id': false, 'currencies._id': false })
            .then(account => res.json(account))
            .catch(next);
    })


    .post('/transactions', getPrices, (req, res, next) => {
        let marketData = req.marketData;
        const { currency, exchange, quantity } = req.body;
        const { _id } = req.user;
        const transaction = { name: currency, quantity };
        const transactionInUSD = getTotalInUSD([transaction], marketData);
        const price = transactionInUSD / quantity;
        
        const transact = Transaction.create({
            user: req.user,
            currency,
            exchange,
            price,
            quantity
        });

        const incrementOrPushCurrency = () => {

            Account.find({ user: _id })
                .then(account => {

                    let holdings = account[0].currencies;
                    let duplicates = holdings.filter(currency => {
                        return currency.name === transaction.name;
                    });
   
                    if(duplicates.length === 0) {
                        return Account.findOneAndUpdate(
                            { user: _id },
                            { $push: { currencies: transaction } },
                            updateOptions
                        );
                    } else if(duplicates.length === 1) {
                        return Account.findOneAndUpdate(
                            { 'user': _id, 'currencies.name': currency },
                            { $inc: { 'currencies.$.quantity': quantity } });
                    } else {
                        next(new HttpError({
                            code: 500,
                            message: 'Internal server error.'
                        }));
                    }
                });
        };

        const updateUSD = Account.findOneAndUpdate(
            { 'user': _id, 'currencies.name': 'USD' },
            { $inc: { 'currencies.$.quantity': -transactionInUSD } }
        );

        Account.findOne({ 'user': _id })
            .then(account => {
                let currentAccountUSD = account.currencies[0].quantity;

                if(currentAccountUSD > transactionInUSD) {

                    Promise.all([transact, incrementOrPushCurrency(), updateUSD])
                        .then(([transaction]) => res.json(transaction));

                } else {
                    next(new HttpError({
                        code: 403,
                        message: 'Insufficient funds'
                    }));
                }
            })  
            .catch(next);
    })

    .get('/transactions', (req, res, next) => {
        const { _id } = req.user;
        Transaction.findOne({ 'user': _id })
            .select({ 'user': false, '_id': false })
            .then(transaction => res.json(transaction))
            .catch(next);
    });
