const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

// * INPUT: Number of campground data to seed into Campground DB
const num = 200;

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.on(
  "error",
  console.error.bind(
    console,
    "Error encountered when connecting to MongoDB! Connection error:"
  )
);
db.once("open", function () {
  console.log("Connection to MongoDB successful!");
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async (num) => {
  await Campground.deleteMany({});
  console.log("Campground DB cleared.");
  for (let i = 0; i < num; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      title: `${sample(descriptors)} ${sample(places)}`,
      // Unsplash API for choosing a random photo from a collection
      // For more info: https://source.unsplash.com/
      // images: "https://source.unsplash.com/collection/483251",
      // ** HARD-CODED TO RANDOM EXISTING PHOTOS IN CLOUDINARY
      images: [
        {
          url: "https://res.cloudinary.com/huiyuank/image/upload/v1623222335/YelpCamp/mj5kda9acp3pjkvyhhm5.jpg",
          filename: "YelpCamp/j2zgtd5usd0t3xxiwvot",
        },
      ],
      price: Math.floor(Math.random() * 30) + 10,
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Placeat id fugiat vero labore deleniti blanditiis quos, consectetur odio. Harum aliquid recusandae eius dolore sapiente eum, dolor quos porro ducimus quam.",
      // ** HARD-CODED TO RANDOM CITY LOCATION
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      // ** HARD-CODED TO EXISTING USER_ID IN DB
      author: "60b9cdd3bf408414e55daa77",
    });
    await camp.save();
  }
  console.log(`Campground DB prepopulated with ${num} campgrounds.`);
};

seedDB(num).then(() => {
  mongoose.connection.close();
  console.log("Connection to MongoDB closed!");
});
