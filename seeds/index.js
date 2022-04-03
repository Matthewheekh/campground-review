const mongoose = require('mongoose');

mongoose
	.connect('mongodb://localhost:27017/yelpCamp')
	.then(() => {
		console.log('Successful connection!');
	})
	.catch((err) => {
		console.log(err);
	});

const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./helper');

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDatabase = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 200; i++) {
		const random = Math.floor(Math.random() * 1000);
		const camp = new Campground({
			title: `${sample(descriptors)} ${sample(places)}`,
			price: i,
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro labore temporibus explicabo saepe quidem, molestias aliquid laudantium itaque architecto ipsam facilis nisi error beatae dolorem repellendus perferendis officia, rem assumenda?',
			location: `${cities[random].city}, ${cities[random].state}`,
			geometry: {
				type: 'Point',
				coordinates: [ cities[random].longitude, cities[random].latitude ]
			},
			images: [
				{
					url:
						'https://res.cloudinary.com/dsc8vbbuu/image/upload/v1640609986/YelpCamp/k7rnhk6blj5dgp6sffjd.jpg',
					filename: 'YelpCamp/k7rnhk6blj5dgp6sffjd'
				}
			],
			author: '61bc8080c67eaab185b10586'
		});
		await camp.save();
	}
};

seedDatabase().then(() => {
	mongoose.connection.close();
});
