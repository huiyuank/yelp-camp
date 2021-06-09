const mongoose = require("mongoose");
// Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.
// For more info: https://github.com/saintedlama/passport-local-mongoose
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
