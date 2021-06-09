// A multer storage engine for Cloudinary. Also consult the Cloudinary API.
// For more info (Cloudinary): https://github.com/cloudinary/cloudinary_npm
// For more info (Multer Storage Cloudinary): https://www.npmjs.com/package/multer-storage-cloudinary
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Associating Cloudinary account with cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  secret: process.env.CLOUDINARY_SECRET,
});

// Setting up instance of CloudinaryStorage and passing in cloudinary object configured above
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpeg", "png", "jpg"],
    transformation: { width: 1024, height: 768, crop: "imagga_crop" },
  },
});

module.exports = {
  cloudinary,
  storage,
};
