const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const shortid = require('shortid');
const ms = require('ms');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');


const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    role: {
        type: String,
        enum: ['مستخدم اصوات', 'مدير اصوات'],
        default: 'مستخدم اصوات'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash the password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (duration) {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: duration
    });
};

// Compare the plain password to hashed password in the database
UserSchema.methods.checkPassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash toekn and set to resetPassword token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + ms('10m');

    return resetToken;

};

// Generate Admin token
UserSchema.statics.generateAdminToken = async function () {
    // Generate token
    return shortid.generate();
};

module.exports = mongoose.model('User', UserSchema);

