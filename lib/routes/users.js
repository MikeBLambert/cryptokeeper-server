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

    .post('/accounts/holdings', (req, res, next) => {
        const holding = req.body;     
        //XXXXXX********DELETE BELOW MARKETDATA VARIABLE******XXXXXXX
        let marketData = [
            {
                'quote': { 'USD': { 'price': 6499.33240876 } },
                'symbol': 'BTC'
            },
            {
                'quote': { 'USD': { 'price': 203.585469611 } }, 
                'symbol': 'ETH'
            }
        ];
        
        const holdingInUSD = getTotalInUSD([holding], marketData);
        const { _id } = req.user;

        Promise.all([ 
            Account.findOneAndUpdate({ user: _id }, { $push: { currencies: holding } }, updateOptions),
            Account.findOneAndUpdate({ 'user': _id, 'currencies.name': 'USD' }, { $inc: { 'currencies.$.quantity': -holdingInUSD } })
        ])
            .then(([accountUpdate, usdChanged]) => res.json(accountUpdate))
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

    .get('/accounts/:id', (req, res, next) => {
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
