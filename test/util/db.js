const connect = require('../../lib/util/connect');
connect('mongodb://localhost:27017/crypto');
const mongoose = require('mongoose');

module.exports = {
    dropCollection(name) {
        return mongoose.connection.dropCollection(name)
            .catch(err => {
                if(err.codeName !== 'NamespaceNotFound') throw err;
            });
    }
};
