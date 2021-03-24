/* eslint-disable new-cap */
const { isArray } = require('lodash');
const { ObjectId } = require('mongodb');
const User = require('../models/userModel');
const Route = require('../models/routeModel');
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
    const user = await User.findOne({ email: email }).populate('routes').populate('likes');

    if (!user) {
        // return to avoid running code below
        next(new AppError(`No email matched with (${email})`, 404));
    }
    // otherwise return JSON
    resp.status(200).json({
        status: 'success',
        data: {
            user: user,
        },
    });
});

exports.likeRoute = asyncErrorWrapper(async ({ body, user }, resp, next) => {
    const emailFromToken = user['https://scav-backend.com email'];
    let matchedUser = await User.findOne({
        email: emailFromToken,
        likes: {
            $elemMatch: { $eq: ObjectId(body.routeID) },
        },
    });

    if (matchedUser) {
        // update route likeCounter and user id refs
        await Route.updateOne(
            {
                _id: ObjectId(body.routeID),
            },
            {
                $inc: { userLikeCount: -1 },
                $pull: { userLikes: matchedUser._id },
            },
        );
        // update the user likes ref
        await User.updateOne(
            {
                _id: ObjectId(matchedUser._id),
            },
            {
                $pull: { likes: body.routeID },
            },
        );
    } else {
        // rematch user w/o extra likes query
        matchedUser = await User.findOne({
            email: emailFromToken,
        });
        // update route likeCounter and user id refs
        await Route.updateOne(
            {
                _id: ObjectId(body.routeID),
            },
            {
                $inc: { userLikeCount: 1 },
                $push: { userLikes: ObjectId(matchedUser._id) },
            },
        );
        // update the user likes ref
        await User.updateOne(
            {
                _id: ObjectId(matchedUser._id),
            },
            {
                $push: { likes: ObjectId(body.routeID) },
            },
        );
    }

    resp.status(200).json({
        status: 'success',
        data: {
            message: `Success`,
        },
    });
});

exports.checkLike = asyncErrorWrapper(async ({ query, user }, resp, next) => {
    const emailFromToken = user['https://scav-backend.com email'];
    const result = await User.findOne({
        email: emailFromToken,
        likes: {
            $elemMatch: { $eq: ObjectId(query.routeID) },
        },
    });
    resp.status(200).json({
        status: 'success',
        data: {
            isLiked: !!result,
        },
    });
});
