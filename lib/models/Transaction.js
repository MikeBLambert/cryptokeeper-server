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
    currency: '', 
    market: '',
    price: '',
    time: '',
    
}, {
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v;
        }
    }
}
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Account;
