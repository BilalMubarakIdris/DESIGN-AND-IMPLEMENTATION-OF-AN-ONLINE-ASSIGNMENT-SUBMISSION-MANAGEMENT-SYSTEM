const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { forwardAuthenticated } = require("../middlewares/auth");

// ============================
// AUTHENTICATION ROUTES
// ============================

// Register
router.get("/register", forwardAuthenticated, auth.getRegister);
router.post("/register", auth.postRegister);

// Login
router.get("/login", forwardAuthenticated, auth.getLogin);
router.post("/login", auth.postLogin);

// Logout
router.post("/logout", auth.logout);

// ============================
// FORGOT / RESET PASSWORD
// ============================

// Show forgot password form
router.get(
  "/forgot-password",
  forwardAuthenticated,
  auth.getForgotPasswordForm
);
// Handle forgot password submission
router.post("/forgot-password", auth.forgotPassword);

// Show reset password form (with token)
router.get("/reset-password/:token", auth.getResetPasswordForm);
// Handle reset password submission
router.post("/reset-password/:token", auth.resetPasswordSubmit);

module.exports = router;
