const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    exchange: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    time: {
        type: Date,
        default: Date.now()
    }
}, {
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v;
        }
    }
}
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
