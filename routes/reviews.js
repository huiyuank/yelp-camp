const express = require("express");
// Router-level middleware works in the same way as application-level middleware, except it is bound to an instance of express.Router()
const router = express.Router({ mergeParams: true });
// Async error wrapper to catch err and pass err to next() to handle async in Express
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// Middleware logic to handle successful review routes
const reviews = require("../controllers/reviews");
// Middleware to validate review data using Joi schema
// Middleware to validate if user is logged in
// Middleware to validate if user is the author
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// POST /campgrounds/:id/reviews
// Add new review from user input in form to campground DB
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE /campgrounds/:id/reviews/:reviewId
// Delete a review on a campground from DB
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
