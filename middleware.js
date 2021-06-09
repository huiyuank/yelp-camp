// Campground DB schema
const Campground = require("./models/campground");
// Review DB schema
const Review = require("./models/review");
// Campground Joi validation schema
// Review Joi validation schema
// User Joi validation schema
const { campgroundSchema, reviewSchema, userSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");

// Middleware to validate campground data using Joi schema
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    // req.flash("error", message);
    // res.redirect("/campgrounds/new");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

// Middleware to validate review data using Joi schema
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

// Middleware to validate user registration data using Joi schema
module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

// Middleware to validate if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnToPath = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

// Middleware to validate if user is the author of campground
module.exports.isCampgroundAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "Unauthorized action!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// Middleware to validate if user is the author of review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "Unauthorized action!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
