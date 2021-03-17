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
