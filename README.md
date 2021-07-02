# [Yelp Camp Project](https://yelp-camp-project.herokuapp.com/)

Access the site here: [yelp-camp-project.herokuapp.com/](https://yelp-camp-project.herokuapp.com/). Refer to [Deployment](#deployment) section for more on deployment.

Yelp Camp project is a code-along that has been adapted and modified from the Udemy course "Web Developer Bootcamp 2021" by Colt Steele. Detailed below the key features, learning points and deployment details.

It has been built using

- [Node.js](https://nodejs.dev/learn) -
JavaScript run-time environment to write server-side scripts outside of a browser.
- [Express](https://expressjs.com/) -
Framework for building web applications on top of Node.js. Simplifies the server creation process and exposes middleware to request and response objects.
- [MongoDB](https://docs.mongodb.com/manual/) -
NoSQL database for persistent data storage and tools to efficiently store and retrieve data.
- [Mongoose](https://mongoosejs.com/docs/guide.html) -
Object Document Modeling (ODM) to model application data and map documents from from database into usable JavaScript objects.

and styled predominantly using [Bootstrap](https://getbootstrap.com/docs/5.0/getting-started/introduction/).

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

### Retrieve all campgrounds

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

When deleting a campground, the reviews on it will no longer be useful. Hence, we will have to clear it out from the database to optimise storage. It is done by defining a post delete middleware in Mongoose for the campground schema. Upon the execution of `findOneAndDelete()`, it will be caught and the campground to be deleted is passed through the middleware for finding and deleting the reviews by ID as well as the photos by filename, that are associated to it.

```
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
```

## Authentication & Authorization

### Passport JS

[Passport](http://www.passportjs.org/) is authentication middleware for Node.js. Based on the docs, it is an extremely flexible, modular, and can be unobtrusively dropped in to any Express-based web application. It has a comprehensive set of strategies to support authentication using a username and password, Facebook, Twitter, and more.

[passport-local](http://www.passportjs.org/packages/passport-local/) is a passport strategy for authenticating with a username and password.

### Registration

![Register](https://user-images.githubusercontent.com/71057935/121510550-57724880-ca1a-11eb-85b7-5d63dce692bf.jpg)

Once we plugin Passport-Local Mongoose into the User schema and configured Passport Local, we can simply use the `register()` method that has been exposed to the User model. It accepts the user object and password literal as arguments, and adds hash and salt field to store the hashed password and the salt value.

```
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({});

User.plugin(passportLocalMongoose);
```

### Login

![Login](https://user-images.githubusercontent.com/71057935/121509964-bbe0d800-ca19-11eb-855a-03e0bf5b84b2.jpg)

Authenticating requests is as simple as calling `passport.authenticate()` and specifying the strategy to employ. 

```
passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login"
})
```

In this application, we have set the url for redirect to be '/login' and flash for failure to true. If authentication fails, Passport will respond with a 401 Unauthorized status, and any additional route handlers will not be invoked. 

![AuthenticationFail](https://user-images.githubusercontent.com/71057935/121510013-c8653080-ca19-11eb-8175-c658813905eb.jpg)

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

![Authentication](https://user-images.githubusercontent.com/71057935/121509988-c3a07c80-ca19-11eb-994e-c3759d62ea68.jpg)

### Logout

Logout easily with a single command `req.logout()`.

### Route protection

After users are authenticated, there may be an additional layer of protection for access rights. For example, a user may only edit a campground if they are the author of it. Similarly, a user may only delete a review written by them and not someone else's. Here, we use the `isCampgroundAuthor()` and `isReviewAuthor` respectively.

In each of the middleware, we are finding the campground or review by ID to check if the user is the same as the owner of the asset using the user ID stored in session. The middlewares are attached to routes that we want to make sure only authorized users can access.

![Authorization1](https://user-images.githubusercontent.com/71057935/121510084-dc109700-ca19-11eb-806d-c734956c1110.jpg)

![Authorization2](https://user-images.githubusercontent.com/71057935/121510091-de72f100-ca19-11eb-826d-7942a9b79701.jpg)

## Validation

### Bootstrap form validation

Form data is being validated on the client-side using [Bootstrap Validation](https://getbootstrap.com/docs/5.0/forms/validation/). The validation happens as the user submits the form or is making any changes to the input fields when the form had been submitted. JavaScript prevents the submission of form if invalid data is detected.

![Validation](https://user-images.githubusercontent.com/71057935/121510237-ffd3dd00-ca19-11eb-873d-047479244550.jpg)

### Joi schema and validate

To prevent users from putting in inconsistent format for data through Postman POST requests for example, we also have to ensure data is validated on the server-side. We use Joi schemas to define the data types and constraints on the fields that correspond to the database schema and the expected values.

## Maps

### Mapbox

[Mapbox](https://docs.mapbox.com/) is a useful tool for visualising geographical locations and we use Mapbox GL JS, a JavaScript library that uses WebGL to render interactive maps from vector tiles and Mapbox styles.

#### Geocoding

When creating a campground, the location input is used to send to an API that Mapbox SDK makes available for [forward geocoding](https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#forwardgeocode). The output is a GeoJSON format with longitude and latitude information and is stored in the campgrounds database. For simplicity, we limit the return to 1.

```
const geoData = await geocoder
    .forwardGeocode({
    query: req.body.campground.location,
    limit: 1,
    })
    .send();
```

#### Cluster map

![Cluster_Map](https://user-images.githubusercontent.com/71057935/121508707-7a036200-ca18-11eb-91e7-894feac44ebc.jpg)

The cluster map uses Mapbox GL JS' built-in cluster functions to visualize points in a circle layer as clusters. The map is configured to center and zoom to fit Singapore. Layers "clusters", "cluster-count" and "unclustered-point" are defined by filtering the campgrounds data and its layout. On clicking the clusters, the map will zoom in to its center. On clicking unclustered points, a marker will popup with text information about its title and location.

#### Show page map

![Show_Map](https://user-images.githubusercontent.com/71057935/121510138-e92d8600-ca19-11eb-90bb-e6303fe6cc3d.jpg)

The show page map puts a marker at the location of the particular campground. It also allows for user to choose different styles for the map by taking in the input and changing the style parameter of the `Map` object.

![Show_Map2](https://user-images.githubusercontent.com/71057935/121510160-ecc10d00-ca19-11eb-92b6-c2a0f4de8a43.jpg)

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

Cloudinary account details are stored in .env file and the important fields to store as environment variables are CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET and CLOUDINARY_URL.

#### Images in MongoDB

The images object in the database stores the URL and filename to the Cloudinary, and the images are served through the CDN with the URL, or deleted using the filename.

## Security Issues

### Mongo injection

[express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize) sanitizes user-supplied data to prevent MongoDB operator injection, either by replacing prohibited characters (ie. `$` and `.`) with '`_`' or completely removing these keys and associated data.

```
const mongoSanitize = require("express-mongo-sanitize");

app.use(mongoSanitize({ replaceWith: "_" }));
```

### Cross-site scripting (XSS)

XSS works by manipulating a vulnerable web site so that it returns malicious JavaScript to users. For example, an attacker may use scripts to expose users' cookies and send it to their own server to steal information. For a primer on XSS, try this interactive game [site](http://www.xss-game.appspot.com/).

Joi validation can be used to escape HTML on top of `sanitize-html`. [sanitize-html](https://www.npmjs.com/package/sanitize-html) has a validate function that detects HTML tags and throws an error if found. It is built as an extension of Joi and incorporated into Joi validation.

```
const sanitizeHtml = require("sanitize-html");

const Joi = BaseJoi.extend((joi) => {
  return {
    type: "string",
    base: joi.string(),
    messages: {
      "string.escapeHTML": "{{#label}} must not include HTML",
    },
    rules: {
      escapeHTML: {
        validate(value, helper) {
          const clean = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
          });
          if (clean !== value)
            return helper.error("string.escapeHTML", { value });
          return clean;
        },
      },
    },
  };
});
```

## Deployment

### Mongo Atlas

Mongo Atlas can be easily set up using their GUI.

1. Mongo sign up
2. Create new cluster
![MongoDB_Cluster_Info](https://user-images.githubusercontent.com/71057935/121511071-dc5d6200-ca1a-11eb-9cd2-d2173131479c.jpg)
3. Add DB user
![MongoDB_User_Info](https://user-images.githubusercontent.com/71057935/121511240-03b42f00-ca1b-11eb-8cc9-bd58e368f5dd.jpg)
4. Add network connection
![MongoDB_Network_Info_LI](https://user-images.githubusercontent.com/71057935/121511224-fdbe4e00-ca1a-11eb-8b67-ded8a872ada3.jpg)
5. Connect to application
![MongoDB_Connect_Info](https://user-images.githubusercontent.com/71057935/121511269-09aa1000-ca1b-11eb-99a1-3e757b9d28c2.jpg)
6. Configure sessions (see below [Session store with connect-mongo](#session-store-with-connect-mongo))

### Session store with connect-mongo

[connect-mongo](https://www.npmjs.com/package/connect-mongo) enables MongoDB session store.

```
const MongoStore = require('connect-mongo');

app.use(session({
  secret: 'foo',
  store: MongoStore.create(options)
}));
```

### Heroku App

As we are uploading code to a machine that will be serving our application, we need to download the SDK that will enable the SSH connection.

1. Heroku sign up
2. Download and install Heroku CLI
![Heroku_CLI](https://user-images.githubusercontent.com/71057935/121511427-3100dd00-ca1b-11eb-81c8-e3f72e417545.jpg)
3. Heroku Login - `heroku login`
![Heroku_Login](https://user-images.githubusercontent.com/71057935/121511400-29d9cf00-ca1b-11eb-9b03-a0fa903c1bf4.jpg)
4. Initialize Git repo
5. Heroku Create - `heroku create`
6. Upload environment variables and turn source code production-ready
7. Git push - `git push heroku master`

Change the site link and other configurations on the settings page of Heroku dashboard.
![Heroku_ConfigVars](https://user-images.githubusercontent.com/71057935/121511374-21819400-ca1b-11eb-93af-86ebe74c4557.jpg)

### Debugging Errors

#### CD

`git push heroku master` on the remote repo to push new changes to the application.

#### Looking to the logs

`heroku logs --tail` will display log information from the VM that is serving the application.

## Nice-to-haves

- [x] [Populate DB with SG parks data](#populate-db-with-sg-parks-data)
- [x] [Infinite scroll on index page](#infinite-scroll-on-index-page)
- [ ] [Average rating for campgrounds](#infinite-scroll-on-index-page)
- [ ] [Search, filter and sort campgrounds](#search-filter-and-sort-campgrounds)

### Populate DB with SG parks data

Data set has been downloaded from [https://data.gov.sg/dataset/parks](https://data.gov.sg/dataset/parks) in GeoJSON format. The variable `cleanData()` is an Array map method that returns an array of locations with the location title and its corresponding longitude and latitude in GeoJSON format. That data is then seeded into the campgrounds DB to enable localisation of the map and locations.

### Infinite scroll on index page

The infinite scrolling behaviour has been implemented using the [Infinite Scroll](https://infinite-scroll.com/) library.

With the Infinite Scroll .js file included, initialize the infiniteScroll on the container element that holds the many children elements as such:

```
let ele = document.querySelector('.infinite-scroll-container');
let infScroll = new InfiniteScroll( ele, {
  // options
  path: 'campgrounds/path-{{#}}',
  append: '.infinite-card',
  history: false,
  status: '.page-load-status'
});
```
##### Options

* `path` is a required variable that specifies the URL to the next page to fetch more data to append to the container. Set to string with {{#}} for incremental page number. 
* `append` specifies the elements that are selected from loaded page to be appended to the container.
* To have a better user experience, use `status` option to display status elements indicating state of page loading. Status elements include `.infinite-scroll-request`, `.infinite-scroll-error` and `.infinite-scroll-last`.

For more information about options, read on the [documentation](https://infinite-scroll.com/options.html).

![Infinite Scroll](https://user-images.githubusercontent.com/71057935/124302937-6325da80-db94-11eb-8b40-a19403aae172.gif)

### Average rating for campgrounds

### Search, filter and sort campgrounds
