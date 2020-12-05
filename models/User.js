const mongoose = require('mongoose');
const brcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        unique: [true, 'Username of each user needs to be unique'],
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.methods.getJwtToken = function () {
    const signedToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_TOKEN_EXPIRE}d`,
    });
    return signedToken;
};

userSchema.methods.comparePassword = async function (password) {
    const match = await brcrypt.compare(password, this.password);
    return match;
};

userSchema.pre('save', async function (next, document) {
    if (this.isModified('password')) {
        const hashedPassword = await brcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
    next();
});

userSchema.pre('remove', async function (next, document) {
    await this.model('Notes').deleteMany({ user: this.id });
    next();
});

module.exports = mongoose.model('User', userSchema);
