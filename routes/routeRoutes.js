const express = require('express');
const { createRoute, getAllRoutes, getRoute, queryByRadius } = require('../controllers/routeContoller');
const { upload } = require('../services/imageUpload');

// eslint-disable-next-line new-cap
const router = express.Router();

// middleware triggered for router params
// router.param('id', (req, resp, next, val) => {
//     console.log(val);
//     next();
// });

// routes!
router.route('/').get(getAllRoutes);
router.route('/:id').get(getRoute);
router.route('/create').post(upload.array('img'), createRoute);
router.route('/radius/:distance/center/:point').get(queryByRadius);
module.exports = router;
