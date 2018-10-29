const express = require('express');
const app = express();

const morgan = require('morgan');
const checkMongo = require('./util/check-mongo');
const bearerToken = require('./util/bearer-token');
const ensureAuth = require('./util/ensure-auth');
const { handler } = require('./util/errors');

// Middleware
app.use(checkMongo);
app.use(morgan('dev', {
    skip() { return process.env.NODE_ENV === 'test'; }
}));
app.use(express.json());
app.use(express.static('public'));
app.use(bearerToken);

// Auth
const auth = require('./routes/auth');
app.use('/api/auth', auth);
app.use(ensureAuth);

// Routes
const users = require('./routes/users');
app.use('/api/users', users);
const leaderboard = require('./routes/leaderboard');
app.use('/api/leaderboard', leaderboard);
const prices = require('./routes/prices');
app.use('/api/prices', prices);

// Errors
app.use((req, res) => {
    console.log('This is 404');
    res.status(404);
    res.end('404 Not Found');
});
app.use(handler);

module.exports = app;
