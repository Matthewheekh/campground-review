const express = require('express');
const passport = require('passport');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');

const userController = require('../controllers/user');

router.route('/register').get(userController.renderFormRegister).post(userController.register);

router
	.route('/login')
	.get(userController.renderFormLogin)
	.post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userController.login);

router.get('/logout', userController.logout);

module.exports = router;
