const { isArray } = require('lodash');
const User = require('../models/userModel');
const asyncErrorWrapper = require('../services/asyncErrorWrapper');

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
exports.getUser = asyncErrorWrapper(async ({ params: { email } }, resp, next) => {
    // waits on promise, returns 1 sale from url/mongo id
    const user = await User.findOne({ email: email });

    if (!user) {
        // populate routes id array(hopefully it works)
        user.populate('routes');
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
