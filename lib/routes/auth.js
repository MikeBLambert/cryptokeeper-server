const User = require('../models/User');

module.exports = router
    .post('/signup', (req, res, next) => {
        const { name, email } = req.body;
        User.create({
            name,
            email
        })
            .then(user => {
                res.json(user);
            })
            .catch(next);
    });
    