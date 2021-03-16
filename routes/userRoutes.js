const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

const { validateOrCreateUser } = require('../controllers/userController');

router.route('/validate').get(validateOrCreateUser);

module.exports = router;
