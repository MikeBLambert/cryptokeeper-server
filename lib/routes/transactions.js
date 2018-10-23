const router = require('express').Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');


module.exports = router
    .post('/', (req, res, next) => {
        const user = req.user._id;
        const { action, currency, exchange, price, quantity } = req.body;
        let session = null;
        mongoose.startSession()
            .then(_session => {
                session = _session;
                session.startTransaction();
                return Transaction.create({ 
                    user, 
                    action, 
                    currency, 
                    exchange, 
                    price, 
                    quantity 
                }, { session: session });
            })
            .then(transaction => {
                // update account to reflect transaction and return
                const account = Account.findOneAndUpdate(
                    { user: user, 'currencies.name': currency }, 
                    { '$inc': { 'currencies.$.quantity': quantity } },
                    { new: true }
                )
                    .session(session);
                // send user transaction            
                return Promise.all([Promise.resolve(transaction), account]);
            })
            .then(([transaction]) => {
                //account that we updated and the transaction
                return Promise.all([Promise.resolve(transaction), session.commitTransaction(), account]);
            })
            .then(([transaction]) => res.json(transaction))
            .catch(next);
    });
