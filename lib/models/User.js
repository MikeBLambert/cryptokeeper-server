const mongoose = require('mongoose');
const { hash, compare } = require('../util/hashing');
const { sign, verify } = require('../util/tokenizer');
const { getTotalInUSD } = require('../util/get-USD');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: String,
    roles: [String]
}, {
        toJSON: {
            transform: function (doc, ret) {
                delete ret.__v;
                delete ret.passwordHash;
            }
        }
    });

userSchema.virtual('clearPassword').set(function (password) {
    this._tempPassword = password;
});

userSchema.pre('save', function (next) {
    this.passwordHash = hash(this._tempPassword);
    next();
});

userSchema.methods.compare = function (clearPassword) {
    return compare(clearPassword, this.passwordHash);
};

userSchema.methods.authToken = function () {
    const jsonUser = this.toJSON();
    return sign(jsonUser);
};

userSchema.statics.findByToken = function (token) {
    try {
        const user = verify(token);
        return Promise.resolve(user);
    } catch (e) {
        return Promise.resolve(null);
    }
};

userSchema.statics.top = function(n, marketData) {
    return this.aggregate([
        {
            $lookup:
            {
                from: 'accounts',
                localField: '_id',
                foreignField: 'user',
                as: 'accounts'
            }
        },
        { $unwind: '$accounts' },
        { $unwind: '$accounts.currencies' },
        {
            $group:
            {
                _id: { userId: '$_id', symbol: '$accounts.currencies.name' },
                total: { $sum: '$accounts.currencies.quantity' }
            }
        },
        {
            $group:
            {
                _id: '$_id.userId',
                currencies: { $addToSet: { quantity: '$total', name: '$_id.symbol' } }
            }
        }
    ])
        .then(results => {
            return results.map(result => ({
                user: result._id,
                //user: result.user
                accounts: [],
                //accounts: result.accounts
                usd: getTotalInUSD(result.currencies, marketData)
            }))
            //.sort();  sorts the results in place
            //take only the top n (which is already being passed to us)

        });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
