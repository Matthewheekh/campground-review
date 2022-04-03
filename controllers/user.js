const User = require('../models/user');

module.exports.renderFormRegister = (req, res) => {
	res.render('users/register');
};

module.exports.register = async (req, res, next) => {
	try {
		const { username, email, password } = req.body.user;
		const user = new User({ email, username });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
		});
	} catch (e) {
		req.flash('error', e.message);
		return res.redirect('/register');
	}
	req.flash('success', 'Succesfully created account');
	return res.redirect('/campgrounds');
};

module.exports.renderFormLogin = (req, res) => {
	res.render('users/login');
};

module.exports.login = async (req, res) => {
	req.flash('success', 'Welcome back!');
	const redirectUrl = req.session.returnTo || '/campgrounds';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You have logged out!');
	res.redirect('/campgrounds');
};
