const mongoose = require("mongoose");
const Review = require("./review");
const { cloudinary } = require("../cloudinary");
const { Schema } = mongoose;
const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema({
  url: String,
  filename: String,
});

// Define a thumbnail virtual property to store reference to width-200 image file
imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

// Contains reference to the campground that the review is added to
const campgroundSchema = new Schema(
  {
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  opts
);

// Query middleware: "findOneAndDelete"
// Catch the deleted campground and delete all reviews associated to it
campgroundSchema.post("findOneAndDelete", async function (data) {
  if (data) {
    await Review.deleteMany({
      _id: {
        $in: data.reviews,
      },
    });
    data.images.map(async (img) => {
      await cloudinary.uploader.destroy(img.filename);
    });
  }
});

campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <a class="text-reset" href="/campgrounds/${
    this._id
  }"><h5 class="display-8">${this.title}</h5></a>
  <p>${this.description.substring(0, 25)}...</p>
  `;
});

module.exports = mongoose.model("Campground", campgroundSchema);
