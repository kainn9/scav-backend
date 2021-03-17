const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
    {
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
                ref: 'Route',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);
// add populate to queries
// userSchema.pre('find', function (next) {
//     this.populate('routes');
//     next();
// });
const User = mongoose.model('User', userSchema);

module.exports = User;
