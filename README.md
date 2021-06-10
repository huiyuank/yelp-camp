# Yelp Camp Project

Yelp Camp project is a code-along that has been adapted and modified from my Udemy course "Web Developer Bootcamp 2021". Detailed below the key features, learning points and deployment details.

It has been built using

- [Node.js](https://nodejs.dev/learn)
- [Express](https://expressjs.com/)
- [MongoDB](https://docs.mongodb.com/manual/)
- [Mongoose](https://mongoosejs.com/docs/guide.html)

and styled predominantly using [Bootstrap](https://getbootstrap.com/docs/5.0/getting-started/introduction/).

## Interface

Access the site here: [yelp-camp-project.herokuapp.com/](https://yelp-camp-project.herokuapp.com/). Refer to [Deployment](#deployment) section for more on deployment.

![image]()

## Full CRUD Functionality

### Create new campground

### Retrieve all campground

### Show one campground

### Delete campground

Also deletes reviews and images from Cloudinary associated to the campground. Refer to [Mongo Relationships](#mongorelationship).

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
