const Route = require('../models/routeModel');
const asyncErrorWrapper = require('../services/asyncErrorWrapper');
const ApiInterface = require('../services/apiInterface');
const User = require('../models/userModel');

exports.createRoute = asyncErrorWrapper(async ({ files, body, user }, resp) => {
    // getting user data to pass as creator
    const emailFromToken = req.user['https://scav-backend.com email'];
    const creator = await User.findOne({ email: emailFromToken });
    const creatorID = creator._id;
    // parse the json part into an object
    const routeJsonData = JSON.parse(body.json);
    // check to see if multer has uploaded any images to bucket and update
    if (files.length) {
        for (const node of routeJsonData) {
            if (node.img) {
                const { location, key } = files.pop();
                node.img = { url: location, key: key };
            }
        }
    }

    // creates sale using req.body and waits for promise to resolve b4 storing in var
    const newRoute = await Route.create({
        title: routeJsonData[0].title,
        nodes: routeJsonData,
        creator: creatorID,
    });
    // add creator ref if route is saved
    creator.routes.push(newRoute);
    creator.save();
    // return JSON;
    resp.status(200).json({
        status: 'success',
        data: {
            route: newRoute,
        },
    });
});

exports.getAllRoutes = asyncErrorWrapper(async ({ query }, resp) => {
    const interface = new ApiInterface(Route.find(), query).filter().sort().limitFields().paginate();
    const routes = await interface.query;

    // return JSON / resp
    resp.status(200).json({
        status: 'success',
        data: {
            routes: routes,
        },
    });
});

exports.getRoute = asyncErrorWrapper(async ({ params: { id } }, resp, next) => {
    // waits on promise, returns 1 sale from url/mongo id
    const route = await Route.findById(id);

    if (!route) {
        // return to avoid running code below
        return next(new AppError(`No route matched with ID(${id})`, 404));
    }
    // otherwise return JSON
    resp.status(200).json({
        status: 'success',
        data: {
            route: route,
        },
    });
});

// '/routes/radius/:distance/center/:point' <-route layout
exports.queryByRadius = asyncErrorWrapper(async ({ params }, resp) => {
    const { distance, point } = params;
    const [lat, lng] = point.split(',');
    const radius = distance / 3963.2; // convert to radius units which is dist / radius of the earth(in miles it is: 3963.2)

    if (!lat || !lat) new AppError('lat/lng is missing', 400);
    const routes = await Route.find({ locations: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    resp.status(200).json({
        status: 'success',
        data: {
            routes: routes,
        },
    });
});
