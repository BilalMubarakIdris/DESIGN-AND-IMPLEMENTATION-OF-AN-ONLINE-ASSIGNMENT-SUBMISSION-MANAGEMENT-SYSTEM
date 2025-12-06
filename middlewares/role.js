const User = require("../models/User");

module.exports.isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
  const user = await User.findById(req.session.userId);
  if (user && user.role === "admin") return next();
  req.flash("error", "Admin only");
  return res.redirect("/");
};
