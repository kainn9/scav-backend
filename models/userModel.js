const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'email invalid'],
    },

    routes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Routes',
        },
    ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
