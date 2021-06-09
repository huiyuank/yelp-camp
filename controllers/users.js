// User DB model with Passport-Local Mongoose plugged in
const User = require("../models/user");

class UserMethods {
  renderRegister = (req, res) => {
    res.render("users/register");
  };

  registerUser = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.flash("success", "Welcome to Yelp Camp!");
      req.login(registeredUser, function (err) {
        if (err) return next(err);
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  };

  renderLogin = (req, res) => {
    res.render("users/login");
  };

  login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnToPath || "/campgrounds";
    delete req.session.returnToPath;
    res.redirect(redirectUrl);
  };

  logout = (req, res) => {
    req.logout();
    req.flash("success", "Successfully logged out!");
    res.redirect("/");
  };
}

module.exports = UserMethods;
