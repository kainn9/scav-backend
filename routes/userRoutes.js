const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

const { validateOrCreateUser, getUser, likeRoute, checkLike } = require('../controllers/userController');
router.route('/email').get(getUser);
router.route('/validate').get(validateOrCreateUser);
router.route('/likeRoute').patch(likeRoute);
router.route('/checkLike').get(checkLike);
module.exports = router;
