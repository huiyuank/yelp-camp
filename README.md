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
|   |   ├── clusterMap.js
|   |   ├── showPageMap.js
|   |   └── validateForms.js
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

### Retrieve all campground

### Show one campground

### Delete campground

Also deletes reviews and images from Cloudinary associated to the campground. Refer to [Delete campground and reviews associated to it](#delete-campground-and-reviews-associated-to-it).

## Mongo Relationships

### Link review to campgrounds

### Create review

### Delete campground and reviews associated to it

## Authentication & Authorization

### Passport JS

### Registration

### Login

### Logout

### Route protection

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

### Cloudinary

#### Images in MongoDB

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
