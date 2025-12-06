const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ===== REGISTER =====
exports.getRegister = (req, res) => {
  res.render("auth/register");
};

exports.postRegister = async (req, res) => {
  try {
    const { name, regNo, email, phone, department, year, semester, password } =
      req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    const hashed = await bcrypt.hash(password, 10);

    // Determine role: first user becomes admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "student";

    // For students, ensure required fields are present
    if (
      role === "student" &&
      (!regNo || !phone || !department || !year || !semester)
    ) {
      req.flash("error", "Please fill all required student fields");
      return res.redirect("/register");
    }

    const user = new User({
      name,
      regNo: role === "student" ? regNo : undefined,
      phone: role === "student" ? phone : undefined,
      department: role === "student" ? department : undefined,
      year: role === "student" ? year : undefined,
      semester: role === "student" ? semester : undefined,
      email,
      passwordHash: hashed,
      role,
    });

    await user.save();
    req.flash(
      "success",
      `Registration successful. ${
        role === "admin" ? "You are admin." : "Please login."
      }`
    );
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/register");
  }
};

// ===== LOGIN =====
exports.getLogin = (req, res) => {
  res.render("auth/login");
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    // Set session
    req.session.userId = user._id;
    req.flash("success", "Logged in successfully");

    // Redirect based on role
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else {
      return res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/login");
  }
};

// ===== LOGOUT =====
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

// ===== FORGOT PASSWORD =====
exports.getForgotPasswordForm = (req, res) => {
  res.render("auth/forgot-password", { title: "Forgot Password" });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No account with that email found");
      return res.redirect("/forgot-password");
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      from: `"Assignment System" <${process.env.SMTP_USER}>`,
      subject: "Password Reset",
      text: `You requested a password reset.\n\nClick here to reset your password:\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    req.flash("success", "Password reset link sent to your email");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error sending email");
    res.redirect("/forgot-password");
  }
};

// ===== RESET PASSWORD =====
exports.getResetPasswordForm = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or expired");
      return res.redirect("/forgot-password");
    }

    res.render("auth/reset-password", {
      token: req.params.token,
      title: "Reset Password",
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/forgot-password");
  }
};

exports.resetPasswordSubmit = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or expired");
      return res.redirect("/forgot-password");
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash("success", "Password has been reset. You can login now.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/forgot-password");
  }
};
