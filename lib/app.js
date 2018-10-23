const express = require('express');
const app = express();

const morgan = require('morgan');
const checkMongo = require('./util/check-mongo');
const bearerToken = require('./util/bearer-token');
const ensureAuth = require('./util/ensure-auth');
const { handler, HttpError } = require('./util/errors');

// Middleware
app.use(checkMongo);
app.use(morgan('dev', {
    skip() {
        // skip logging on test
        return process.env.NODE_ENV === 'test';
    }
}));
app.use(express.static('public'));
app.use(express.json());
app.use(bearerToken);

// Auth
const auth = require('./routes/auth');
app.use('/auth', auth);
app.use(ensureAuth);

// Routes
const accounts = require('./routes/accounts');
const transactions = require('./routes/transactions');
app.use('/accounts', accounts);
app.use('/transactions', transactions);

// Errors
app.use((req, res) => {
    console.log('This is 404');
    res.status(404);
    res.end('404 Not Found');
});
app.use(handler);

module.exports = app;
