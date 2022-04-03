if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();

const passport = require('passport');
const LocalStrategy = require('passport-local');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/expressError');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const campgrounds = require('./routers/campgrounds');
const reviews = require('./routers/reviews');
const users = require('./routers/users');

const User = require('./models/user');

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelpCamp'

mongoose
	.connect(dbURL)
	.then(() => {
		console.log('Successful connection!');
	})
	.catch((err) => {
		console.log(err);
	});

app.engine('ejs', engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'somesecret'

const store = MongoStore.create({
    mongoUrl: dbURL,
    secret,
    touchAfter: 24*60*60
})

store.on('error', e => {
    console.log("Session store error: ", e)
})

const sessionConfig = {
    store,
	name: 'somesession',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use('/', users);

app.get('/', async (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { status = 400 } = err;
	if (!err.message) {
		err.message = 'Something went wrong.';
	}
	res.status(status).render('unknown', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});

// https://polar-eyrie-15653.herokuapp.com/ | https://git.heroku.com/polar-eyrie-15653.git
