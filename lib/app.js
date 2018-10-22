const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const auth = require('./routes/auth');
app.use('/auth', auth);

module.exports = app;
