const mongoose = require('mongoose');
const { getTotalInUSD } = require('../util/get-USD');

const accountSchema = new mongoose.Schema(
    {
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
            },
            quantity: {
                type: Number,
                default: 0
            }
        }]
    }, 
    {
        toJSON: {
            transform: function(doc, ret) {
                delete ret.__v;
            }
        }
    }
);

accountSchema.methods.accountTotal = function(marketData) {
    return getTotalInUSD(this.currencies, marketData);
};


const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
