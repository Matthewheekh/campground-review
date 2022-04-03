const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mbxToken });

module.exports.showAllCampgrounds = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('index', { campgrounds });
};

module.exports.showCampgroundDetails = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author'
			}
		})
		.populate('author');
	if (!campground) {
		req.flash('error', 'Campground not found!');
		return res.redirect(`/campgrounds`);
	}
	res.render('show', { campground });
};

module.exports.renderFormCreateCampground = (req, res) => {
	res.render('new');
};

module.exports.createCampground = async (req, res) => {
	const geoData = await geocodingClient
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 2
		})
		.send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	campground.images = req.files.map((file) => ({ url: file.path, filename: file.filename }));
	campground.author = req.user._id;
    await campground.save();
    console.log(campground)
	req.flash('success', 'Successfully created a campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderFormEditCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Campground not found!');
		return res.redirect(`/campgrounds`);
	}
	res.render('edit', { campground });
};

module.exports.editCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	const images = req.files.map((file) => ({ url: file.path, filename: file.filename }));
	campground.images.push(...images);
	await campground.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash('success', 'Successfully updated campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted a campground!');
	res.redirect(`/campgrounds`);
};
