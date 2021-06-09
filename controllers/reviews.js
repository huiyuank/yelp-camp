// Campground DB schema
const Campground = require("../models/campground");
// Review DB schema
const Review = require("../models/review");

module.exports.createReview = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await campground.save();
  await review.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteReview = async (req, res, next) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  req.flash("success", "Successfully deleted review!");
  res.redirect(`/campgrounds/${id}`);
};
