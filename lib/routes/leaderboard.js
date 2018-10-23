const router = require('express').Router();
const Account = require('../models/Account');

// const ensureAuth = require('../util/ensure-auth')

const updateOptions = {
    new: true,
    runValidators: true
};

module.exports = router
    .get('/', (req, res, next) => {
        Account.find()
            .limit(10)
            .sort('-currencies[0].quantity')
            .select({ 'user': false, '_id': false, 'currencies._id': false })
            .then(accounts => res.json(accounts))
            .catch(next);
    });
