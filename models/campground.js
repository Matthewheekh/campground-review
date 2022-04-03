const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');

const imageSchema = new mongoose.Schema({
	url: String,
	filename: String
});

imageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/w_200');
});

const opt = { toJSON: { virtuals: true } };

const campgroundSchema = new mongoose.Schema({
	title: String,
	price: Number,
	description: String,
	location: String,
	geometry: {
		type: {
			type: String,
			enum: [ 'Point' ],
			required: true
		},
		coordinates: {
			type: [ Number ],
			required: true
		}
	},
	images: [ imageSchema ],
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
}, opt);

campgroundSchema.virtual('properties.popUpMarkup').get(function() {
	return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

campgroundSchema.post('findOneAndDelete', async function(doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		});
	}
});

const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;
