const router = require('express').Router();
const User = require('../models/User');

const ensureAuth = require('../util/ensure-auth')


module.exports = router
    // .put('/:id', ensureAuth, (req, res, next) => {
    //     const { name, email, clearPassword } = req.body;
    //     User.create({
    //         name,
    //         email,
    //         clearPassword
    //     }).then(user => {
    //         res.json(user);
    //     });
    // })
