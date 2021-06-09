const express = require("express");
// Router-level middleware works in the same way as application-level middleware, except it is bound to an instance of express.Router()
const router = express.Router();
// Async error wrapper to catch err and pass err to next() to handle async in Express
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
// To access all passport middleware
const passport = require("passport");
// Middleware to validate user registration data using Joi schema
const { validateUser } = require("../middleware");

// Middleware logic to handle successful authentication routing
const users = require("../controllers/users");
const usersMethod = new users();

router
  .route("/register")
  // GET /register
  // Form to create new user account
  .get(usersMethod.renderRegister)
  // POST /register
  // Adds new user to DB
  // Passport has built-in check to ensure username is unique
  // Use req.login() to automatically login user upon successful registration
  .post(validateUser, catchAsync(usersMethod.registerUser));

router
  .route("/login")
  // GET /login
  // Login page
  .get(usersMethod.renderLogin)
  // POST /login
  // Checks if credentials are valid and authenticate user using Passport middleware passport.authenticate()
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    usersMethod.login
  );

// GET /logout
router.get("/logout", usersMethod.logout);

// TO BUILD: Change password? Reset/Forgot password?

// TO BUILD: Delete account and associated reviews &| campgrounds

module.exports = router;
