const mongoose = require('mongoose');
const { hash, compare } = require('../util/hashing');
const { sign, verify } = require('../util/tokenizer');

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

const User = mongoose.model('User', userSchema);

module.exports = User;
