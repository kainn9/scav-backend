const { isArray } = require('lodash');
const User = require('../models/userModel');
const asyncErrorWrapper = require('../services/asyncErrorWrapper');
const AppError = require('../services/appError');

exports.validateOrCreateUser = asyncErrorWrapper(async (req, resp, next) => {
    const emailFromToken = req.user['https://scav-backend.com email'];
    let newUser = await User.find({
        email: emailFromToken,
    });
    if (isArray(newUser) && !newUser.length) {
        newUser = await User.create({
            email: emailFromToken,
            routes: [],
        });
    }

    resp.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    });
});
exports.getUser = asyncErrorWrapper(async (req, resp, next) => {
    const {
        query: { email },
    } = req;
    // waits on promise, returns 1 sale from url/mongo id
    const user = await User.findOne({ email: email }).populate('routes');

    if (!user) {
        // return to avoid running code below
        return next(new AppError(`No email matched with (${email})`, 404));
    }
    // otherwise return JSON
    resp.status(200).json({
        status: 'success',
        data: {
            user: user,
        },
    });
});
