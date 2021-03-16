const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

const { validateOrCreateUser } = require('../controllers/userController');
// middleware triggered for router params
// router.param('id', (req, resp, next, val) => {
//     console.log(val);
//     next();
// });

// => /users
router.route('/validate').get(validateOrCreateUser);

module.exports = router;
