// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
// This would make storing configuration in the environment, separate from code
// For more info: https://github.com/motdotla/dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
// Express 4.x layout, partial and block template functions for the EJS template engine.
// For more info: https://github.com/JacksonTian/ejs-mate
const ejsMate = require("ejs-mate");
// Async error wrapper to catch err and pass err to next() to handle async in Express
const catchAsync = require("./utils/catchAsync");
// Error class to add error message and status code before throwing error
const ExpressError = require("./utils/ExpressError");
// Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
// For more info: https://www.npmjs.com/package/method-override
const methodOverride = require("method-override");
// The express-session middleware stores session data on the server; only saves the session ID in the cookie itself, not session data.
// By default, it uses in-memory storage and is not designed for a production environment.
const session = require("express-session");
// Flash messages that are temporary
const flash = require("connect-flash");
// Strategies, and their configuration, are supplied via the use() function.
// For example, the following uses the LocalStrategy for username/password authentication.
const passport = require("passport");
const LocalStrategy = require("passport-local");
// Middleware that sanitizes user-supplied data to prevent MongoDB Operator Injection.
// For more info: https://www.npmjs.com/package/express-mongo-sanitize
const mongoSanitize = require("express-mongo-sanitize");
// Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
// For more info: https://helmetjs.github.io/
const helmet = require("helmet");

// User DB model with Passport-Local Mongoose plugged in
const User = require("./models/user");

// Campground Router() defined routes
const campgroundRoutes = require("./routes/campgrounds");
// Review Router() defined routes
const reviewRoutes = require("./routes/reviews");
// Authentication Router() defined routes
const userRoutes = require("./routes/users");
// MongoDB session store for Connect and Express
const MongoDBStore = require("connect-mongo");

const path = require("path");
const app = express();

// Open MongoDB connection to Mongo Atlas for production
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// Open MongoDB connection for local development
// const dbUrl = "mongodb://localhost:27017/yelp-camp";
// MongoDB connection using Mongoose
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
// Include error handling for DB connection
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

// Tell Express the engine used to parse EJS
app.engine("ejs", ejsMate);
// Include use of EJS and set to look into views directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Parser for req.body from forms and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Add method override to handle PUT/PATCH/DELETE requests to abide by RESTful routing
app.use(methodOverride("_method"));
// Serves static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Setting secret for production
const secret = process.env.SECRET || "thisshouldbeabettersecret";

// Define session middleware in production environment
const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("Session store error", e);
});

// Set secret to be passed into session middleware
const sessionConfig = {
  store,
  name: "sesh",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // In deployment, cookies can only be confiured on HTTPS with secure set to true
    // secure: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
// Define session middleware in development environment
app.use(session(sessionConfig));

// Add flash middleware
app.use(flash());

// In an Express-based application, passport.initialize() middleware is required to initialize Passport.
app.use(passport.initialize());
// passport.session() middleware must be used for persistent login sessions too.
// Use session() before passport.session() to ensure that the login session is restored in the correct order
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// Use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); // How to store user
passport.deserializeUser(User.deserializeUser()); // How to "unstore" user

// Add mongo sanitizer that replaces any prohibited characters ($, .) in mongo data with '_'
app.use(mongoSanitize({ replaceWith: "_" }));
// Adds helmet middlewares to secure Express apps by setting various HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

const scriptSrcUrls = [
  // "https://stackpath.bootstrapcdn.com/",
  "https://cdn.jsdelivr.net",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  // "https://stackpath.bootstrapcdn.com/",
  "https://cdn.jsdelivr.net",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/huiyuank/", // * SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://user-images.githubusercontent.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Get access to the message in flash, if any, and pass to any templates next
app.use((req, res, next) => {
  // console.log(req.session);
  // Set to remember in session the path to return to as long as not from login
  if (!["/login", "/register", "/logout", "/"].includes(req.originalUrl)) {
    req.session.returnToPath = req.originalUrl;
  }
  // Store local variables accessible to all templates
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// GET /
// Home page
app.get("/", (req, res) => {
  res.render("home");
});

// Middleware to incorporate all routes defined on campgroundRoutes
// Deals with routes that start with "/campgrounds"
// Look at "routes/campgrounds.js" for more info
app.use("/campgrounds", campgroundRoutes);

// Middleware to incorporate all routes defined on reviewRoutes
// Deals with routes that start with "/campgrounds/:id/reviews"
// Look at "routes/reviews.js" for more info
app.use("/campgrounds/:id/reviews", reviewRoutes);

// Middleware to incorporate all routes defined on userRoutes
// Deals with routes that start with "/"
// Look at "routes/users.js" for more info
app.use("/", userRoutes);

// 404 handler: comes to this route only if every other route above does not match
// ie. No such route exists on site
app.all("*", (req, res, next) => {
  // res.status(404).send("404!");
  next(new ExpressError("Page Not Found", 404));
});

// Custom error handling function
// Grabs status code and message from err passed from whatever middleware above throws
// Else, by default, outputs status code of 500 and a message of "Something went wrong"
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error", { err });
});

// Serve on localhost:3000
app.listen(3000, () => {
  console.log("Serving on port 3000!");
});
