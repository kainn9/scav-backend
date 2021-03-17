const mongoose = require('mongoose');
const slugify = require('slugify');

const routeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Error: Sale title is Required'],
            trim: true,
            minLength: [1, 'Route title is less than 1 characters'],
        },
        slug: {
            type: String,
        },
        nodes: {
            type: [
                {
                    title: String,
                    text: String,
                    img: { url: String, key: String },
                    soundMeda: String,
                    lat: Number,
                    lng: Number,
                    key: String,
                },
            ],
            minLength: [1, 'Route must have at least 1 node'],
            maxLength: [8, 'Max nodes per route is 8'],
            // for node titles
            validate: {
                message: 'all nodes must have title',
                validator: function (nodes) {
                    for (const node of nodes) {
                        if (!node.title) return false;
                    }
                    return true;
                },
            },
            // for node lng/lat
            validate: {
                message: 'Invalid Lat or Lng(Lat and Lng must exist and be a number between -90 -> 90',
                validator: function (nodes) {
                    for (const node of nodes) {
                        // lat must exist, and within -90 -> 90
                        if (!node.lat || node.lat > 90 || node.lat < -90) return false;
                        // lng must exist, and within -90 -> 90
                        if (!node.lng || node.lng > 90 || node.lng < -90) return false;
                    }
                    return true;
                },
            },
        },
        creator: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'route must have creator'],
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);
// index to search by title
routeSchema.index({ title: 'text' });
// index for geo query
routeSchema.index({ startLocation: '2dsphere' });

// Middleware .pre runs inbtwn .save() and .create(), this === saved document
routeSchema.pre('save', function (next) {
    // create slug from title
    this.slug = slugify(this.title, { lower: true });
    for (const node of this.nodes) {
        // overwrite keys using uniq id's just in case
        node.key = node['_id'];
    }

    next();
});
// add populate to queries
routeSchema.pre(/^find/, function (next) {
    this.populate('creator'); // { path: 'creator', select: -__v} if you wanna filter fields
    next();
});

// Middleware .post runs after .create(), doc === created document
routeSchema.post('save', function (doc, next) {
    next();
});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
