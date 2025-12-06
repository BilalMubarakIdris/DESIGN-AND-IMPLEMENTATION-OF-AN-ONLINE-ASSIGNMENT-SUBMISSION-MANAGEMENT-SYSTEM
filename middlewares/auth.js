module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  req.flash("error", "Please login first");
  res.redirect("/login");
};

module.exports.forwardAuthenticated = (req, res, next) => {
  if (!req.session.userId) return next();
  res.redirect("/dashboard");
};
