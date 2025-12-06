const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  regNo: String,
  email: { type: String, unique: true },
  phone: String,
  department: String,
  year: String,
  semester: String,
  passwordHash: String,
  role: { type: String, default: "student" },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model("User", userSchema);
