// Campground DB schema
const Campground = require("../models/campground");
// Cloudinary object for deletion of image from Cloudinary
const { cloudinary } = require("../cloudinary");
// A JS SDK for working with Mapbox APIs, specifically we need API for forward geocoding
// Create a service client, import the service's factory function from '@mapbox/mapbox-sdk/services/{service}' and provide it with access token.
// For more info: https://github.com/mapbox/mapbox-sdk-js
// Input: query string
// Output: coordinates [long, lat] (GeoJSON)
// GeoJSON is an open standard file format for representing map data.
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res, next) => {
  const {number:pageno=1} = req.params;
  let leftbound = (pageno - 1) * 10
  let rightbound = (pageno - 1) * 10 + 10
  const campgrounds = await Campground.find({});
  console.log(leftbound, rightbound)
  if (leftbound < campgrounds.length) {
    return res.render("campgrounds/index", { campgrounds, leftbound, rightbound });
  } else {
    const endOfContent = true;
    return res.render("campgrounds/index", { campgrounds, endOfContent });
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // By using Joi, remove the need to write logic to check data, instead define schema and run validate
  // if (!req.body.campground)
  //   throw new ExpressError("Invalid campground data", 400);
  console.log(req.body);
  console.log(req.files);
  // res.send("IT WORKED!");
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((img) => ({
    url: img.path,
    filename: img.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  // Flash message for new campground added under key of success
  req.flash("success", "Successfully added new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params;
  const { deleteImages } = req.body;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  if (deleteImages) {
    // await campground.updateOne({
    //   $pull: { images: { filename: { $in: deleteImages } } },
    // });
    campground.images = campground.images.filter(
      (img) => !deleteImages.includes(img.filename)
    );
    deleteImages.map(async (filename) => {
      await cloudinary.uploader.destroy(filename);
    });
  }
  const images = req.files.map((img) => ({
    url: img.path,
    filename: img.filename,
  }));
  campground.images.push(...images);
  await campground.save();
  // Flash message for new campground added under key of success
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect(`/campgrounds`);
};
