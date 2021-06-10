# [Yelp Camp Project](https://yelp-camp-project.herokuapp.com/)

Yelp Camp project is a code-along that has been adapted and modified from the Udemy course "Web Developer Bootcamp 2021" by Colt Steele. Detailed below the key features, learning points and deployment details.

It has been built using

- [Node.js](https://nodejs.dev/learn)
JavaScript run-time environment to write server-side scripts outside of a browser.
- [Express](https://expressjs.com/)
Framework for building web applications on top of Node.js. Simplifies the server creation process and exposes middleware to request and response objects.
- [MongoDB](https://docs.mongodb.com/manual/)
NoSQL database for persistent data storage and tools to efficiently store and retrieve data.
- [Mongoose](https://mongoosejs.com/docs/guide.html)
Object Document Modeling (ODM) to model application data and map documents from from database into usable JavaScript objects.

and styled predominantly using [Bootstrap](https://getbootstrap.com/docs/5.0/getting-started/introduction/).

## Interface

Access the site here: [yelp-camp-project.herokuapp.com/](https://yelp-camp-project.herokuapp.com/). Refer to [Deployment](#deployment) section for more on deployment.

## Folder Directory

```
.
├── cloudinary                  # Cloudinary config
|   └── index.js
├── controllers                 # Express middleware logic
|   ├── campgrounds.js
|   ├── reviews.js
|   └── user.js
├── models                      # Mongoose DB schemas
|   ├── campgrounds.js
|   ├── reviews.js
|   └── user.js
├── public                      # Static JS and CSS files
|   ├── css
|   |   ├── app.css
|   |   ├── home.css
|   |   └── starability-coinFlip.css
|   └── js
|       ├── clusterMap.js
|       ├── showPageMap.js
|       └── validateForms.js
├── routes                      # Defined Express routes and attached middlewares
|   ├── campgrounds.js
|   ├── reviews.js
|   └── user.js
├── seeds                       # Data and tools to seed initial DB
|   ├── cities.js
|   ├── index.js
|   ├── seedHelpers.js
|   └── seedPark.js
├── utils                       # Tools and utilities
|   ├── catchAsync.js
|   └── ExpressError.js
├── views                       # EJS files
|   ├── campgrounds
|   |   ├── edit.ejs
|   |   ├── index.ejs
|   |   ├── new.ejs
|   |   └── show.ejs
|   ├── layouts
|   |   └── boilerplate.ejs
|   ├── partials
|   |   ├── flash.ejs
|   |   ├── footer.ejs
|   |   └── navbar.ejs
|   ├── users
|   |   ├── login.ejs
|   |   └── register.ejs
|   ├── error.ejs
|   └── home.ejs
├── app.js                      # Root file
├── middleware.js               # Validation middleware
├── package-lock.json           # NPM dependency specifications
├── package.json                # NPM dependencies
├── schemas.js                  # Joi validation schemas
├── .gitignore
└── README.md
```

## Full CRUD Functionality

### Create new campground

#### POST request to '/campgrounds'
Inserts new campground into DB upon validating and parsing user input from form data. Only authenticated users can create campground and leave a review. Refer to [Authentication](#authentication-and-authorization).

### Retrieve all campground

#### GET request to '/campgrounds'
Find all campgrounds from DB.

### Show one campground

#### GET request to '/campgrounds/:id'
Find campground by ID from DB. Only the author who created the campground has rights to edit and delete the campground. Refer to [Authorization](#authentication-and-authorization).

### Edit campground

#### PUT request to '/campgrounds/:id' 
Edit campground details from DB. Only the author who created the campground has rights to edit.

### Delete campground

#### DELETE request to '/campgrounds/:id'
Delete campground from DB. Only the author who created the campground has rights to delete. Also deletes reviews and images from Cloudinary associated to the campground. Refer to [Delete campground and reviews associated to it](#delete-campground-and-reviews-associated-to-it).

## Mongo Relationships

### Link review to campgrounds

This section displays how one-to-many relationships can be mapped in Mongo. With two different schemas defined, either the parent stores reference to the childrens' IDs or the children store the reference to the parent.

For a single campground, there can be multiple users leaving multiple reviews on it. Here, we are making the campground (parent) store reference to the reviews (children) in an array.

The schemas are defined as such:

```
const campgroundSchema = new Schema(
  {
    .
    .
    .
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
}

const reviewSchema = new Schema({
  rating: {
    type: Number,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  .
  .
  .
}
```

### Create review

When adding a review, not only do we need to create the review object to add into the reviews collection, will we also have to push its ID into the reviews array of the associated campground and save it.

### Delete campground and reviews associated to it

When deleting a campground, the reviews on it will no longer be useful. Hence, we will have to clear it out from the database to optimise storage. It is done by defining a post delete middleware in Mongoose for the campground schema. Upon the execution of `findOneAndDelete()`, it will be caught and the campground to be deleted is passed through the middleware for finding and deleting the reviews by ID that are associated to it.

## Authentication & Authorization

### Passport JS

[Passport](http://www.passportjs.org/) is authentication middleware for Node.js. Based on the docs, it is an extremely flexible, modular, and can be unobtrusively dropped in to any Express-based web application. It has a comprehensive set of strategies to support authentication using a username and password, Facebook, Twitter, and more.

[passport-local](http://www.passportjs.org/packages/passport-local/) is a passport strategy for authenticating with a username and password.

### Registration & Login

Once we plugin Passport-Local Mongoose into the User schema and configured Passport Local, we can simply use the `register()` method that has been exposed to the User model. It accepts the user object and password literal as arguments, and adds hash and salt field to store the hashed password and the salt value.

```
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({});

User.plugin(passportLocalMongoose);
```

Authenticating requests is as simple as calling `passport.authenticate()` and specifying the strategy to employ. 

```
passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login"
})
```

In this application, we have set the url for redirect to be '/login' and flash for failure to true. If authentication fails, Passport will respond with a 401 Unauthorized status, and any additional route handlers will not be invoked. 

Upon successful registration and login, the user ID will be stored in the session for preservation of authentication state. In the `isLoggedIn()` middleware, we are using the `isAuthenticated()` method on request to check if the user is authenticated. The `isLoggedIn()` middleware can then be attached to routes that we want to make sure only authenticated users can access. If they are unathenticated, they will be redirected to login upon hitting these routes.

```
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnToPath = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};
```

### Logout

Logout easily with a single command `req.logout()`.

### Route protection

After users are authenticated, there may be an additional layer of protection for access rights. For example, a user may only edit a campground if they are the author of it. Similarly, a user may only delete a review written by them and not someone else's. Here, we use the `isCampgroundAuthor()` and `isReviewAuthor` respectively.

In each of the middleware, we are finding the campground or review by ID to check if the user is the same as the owner of the asset using the user ID stored in session. The middlewares are attached to routes that we want to make sure only authorized users can access.

## Validation

### Bootstrap form validation

### JavaScript regular expression

### Joi schema and validate

## Maps

### Mapbox

#### Geocoding

#### Cluster map

#### Show page map

## Image Upload & Cloudinary

### Multer

Images are parsed with Multer middleware. [Mutler](https://github.com/expressjs/multer) is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.

### Cloudinary

Images are uploaded to and stored in [Cloudinary](https://cloudinary.com/home-6-4-video-b). A multer storage engine for Cloudinary exposes middleware for integration. 

```
const multer = require("multer");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'some-folder-name',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) => 'computed-filename-using-request',
  }
});
const upload = multer({ storage });
```

#### Images in MongoDB

The images object in the database stores the URL and filename to the Cloudinary, and the images are served through the CDN with the URL, or deleted using the filename.

## Security Issues

### Mongo injection

### Cross-site scripting (XSS)

## Deployment

### Mongo Atlas

### Session store with connect-mongo

### Heroku App

## Nice-to-haves

### Populate DB with SG parks data

### Infinite scroll on index page
