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
        transform: function(doc, ret) {
            delete ret.__v;
            delete ret.passwordHash;
        }
    }
});

userSchema.virtual('clearPassword').set(function(password) {
    this._tempPassword = password;
});

userSchema.pre('save', function(next) {
    this.passwordHash = hash(this._tempPassword);
    next();
});

userSchema.methods.compare = function(clearPassword) {
    return compare(clearPassword, this.passwordHash);
};

userSchema.methods.authToken = function() {
    const jsonUser = this.toJSON();
    return sign(jsonUser);
};

userSchema.statics.findByToken = function(token) {
    try {
        const user = verify(token);
        return Promise.resolve(user);
    } catch(e) {
        return Promise.resolve(null);
    }
};

userSchema.statics.top = function(n, marketData) {
    return this.aggregate([
        { $lookup: {
            from: 'accounts',
            localField: '_id',
            foreignField: 'user',
            as: 'accounts'
        } },
        { $unwind: '$accounts' },
        { $unwind: '$accounts.currencies' },
        { $group: {
            _id: { userId: '$_id', symbol: '$accounts.currencies.name' },
            total: { $sum: '$accounts.currencies.quantity' }
        } },
        { $group: {
            _id: '$_id.userId',
            currencies: { $addToSet: { quantity: '$total', name: '$_id.symbol' } }
        } },
        { $lookup: {
            from: 'accounts',
            localField: '_id',
            foreignField: 'user',
            as: 'accounts'
        } },
        { $project: { accounts: { '__v': false, '_id': false, 'user': false } } },
        { $project: { accounts: { currencies: { '_id': false } } } },
        { $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
        } },
        { $project: { user: { 'passwordHash': false, '__v': false, '_id': false } } }
    ])
        .then(results => {

            const allUsers = results.map(result => ({
                user: result.user,
                accounts: result.accounts,
                usd: getTotalInUSD(result.currencies, marketData)
            }));

            function sortByTotalUSD(a, b) {
                const usdA = a.usd;
                const usdB = b.usd;

                let comparison = 0;
                if(usdA < usdB) comparison = 1;
                else if(usdA > usdB) comparison = -1;

                return comparison;
            }

            return allUsers.sort(sortByTotalUSD).slice(0, n);


        });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
