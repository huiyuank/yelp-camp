const express = require("express");
// Router-level middleware works in the same way as application-level middleware, except it is bound to an instance of express.Router()
const router = express.Router();
// Async error wrapper to catch err and pass err to next() to handle async in Express
const catchAsync = require("../utils/catchAsync");

// Middlewares logic to handle successful campgrounds routes
const campgrounds = require("../controllers/campgrounds");
// Mutler is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
// For more info: https://github.com/expressjs/multer
const multer = require("multer");
// Instance of CloudinaryStorage object
const { storage } = require("../cloudinary");
// Initialise and add a destination for files (DiskStorage or MemoryStorage in development)
const upload = multer({ storage });

// Middleware to validate campground data using Joi schema
// Middleware to validate if user is logged in
// Middleware to validate if user is the author
const {
  validateCampground,
  isLoggedIn,
  isCampgroundAuthor,
} = require("../middleware");

router.route('/page-:number').get(catchAsync(campgrounds.index))

router
  .route("/")
  // GET /campgrounds
  // All campgrounds page
  .get(catchAsync(campgrounds.index))
  // POST /campgrounds
  // Add new campground from user input in form to DB
  // only with authentication (isLoggedIn middleware)
  .post(
    isLoggedIn,
    upload.array("campground[image]"),
    validateCampground,
    campgrounds.createCampground
  );

// GET /campgrounds/new
// Form for adding a new campground
// PROTECTED: Only with the correct credentials and authorisation (isLoggedIn middleware)
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  // GET /campgrounds/:id
  // Retrieve and display a particular selected campground with the reviews
  .get(catchAsync(campgrounds.showCampground))
  // PUT /campgrounds/:id
  // Submit edit to campground onto DB
  // only with the correct credentials and authorisation (owner)
  .put(
    isLoggedIn,
    isCampgroundAuthor,
    upload.array("campground[image]"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  // DELETE /campgrounds/:id
  // Delete a campground from DB and all reviews associated to it
  // only with the correct credentials and authorisation (owner)
  .delete(
    isLoggedIn,
    isCampgroundAuthor,
    catchAsync(campgrounds.deleteCampground)
  );

// GET /campgrounds/:id/edit
// Form for editing a campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isCampgroundAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
