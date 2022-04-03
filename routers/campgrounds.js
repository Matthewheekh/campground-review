const express = require('express');
const router = express.Router({ mergeParams: true });

const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCampgroundAuthor, validateCampground } = require('../middleware');

const campgroundController = require('../controllers/campground');

router
	.route('/')
	.get(catchAsync(campgroundController.showAllCampgrounds))
	.post(isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(campgroundController.createCampground));

router.get('/new', isLoggedIn, campgroundController.renderFormCreateCampground);

router
	.route('/:id')
	.get(catchAsync(campgroundController.showCampgroundDetails))
	.put(isLoggedIn, isCampgroundAuthor, upload.array('campground[image]'), validateCampground, catchAsync(campgroundController.editCampground))
	.delete(isLoggedIn, isCampgroundAuthor, catchAsync(campgroundController.deleteCampground));

router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, catchAsync(campgroundController.renderFormEditCampground));

module.exports = router;
