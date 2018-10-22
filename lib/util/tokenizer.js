const jwt = require('jsonwebtoken');
const APP_SECRET = process.env.APP_SECRET || 'changemenow';

module.exports = {
    sign(payload) {
        return jwt.sign({ payload }, APP_SECRET, { expiresIn: '1h' });
    },
    verify(token) {
        return jwt.verify(token, APP_SECRET).payload;
    }
};
