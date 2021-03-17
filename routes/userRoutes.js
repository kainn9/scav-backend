const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

const { validateOrCreateUser, getUser } = require('../controllers/userController');
router.route('/email').get(getUser);
router.route('/validate').get(validateOrCreateUser);

module.exports = router;
