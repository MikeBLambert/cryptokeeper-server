const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    exchange: {
        type: String,
        enum: 'Fake Market',
        required: true
    },
    currencies: [{
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        }
    }]
}, {
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v;
        }
    }
}
);

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
