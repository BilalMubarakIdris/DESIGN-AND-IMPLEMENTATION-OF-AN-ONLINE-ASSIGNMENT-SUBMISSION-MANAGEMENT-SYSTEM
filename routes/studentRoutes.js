// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const subCtrl = require("../controllers/submissionController");
const { ensureAuthenticated } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");

// ----------------------------
// Student Dashboard
// ----------------------------
router.get("/", ensureAuthenticated, (req, res) => {
  res.render("student/dashboard", { title: "Student Dashboard" });
});

// ----------------------------
// Submit assignment form
// ----------------------------
router.get("/submit", ensureAuthenticated, subCtrl.getSubmitForm);

// Handle assignment submission
router.post(
  "/submit",
  ensureAuthenticated,
  upload.single("file"),
  subCtrl.postSubmit
);

// ----------------------------
// View student’s own submissions
// ----------------------------
router.get("/submissions", ensureAuthenticated, subCtrl.mySubmissions);
// View student's grades
router.get("/results", ensureAuthenticated, async (req, res) => {
  const Submission = require("../models/Submission");
  const submissions = await Submission.find({
    student: req.session.userId,
  }).lean();
  res.render("student/results", { submissions, title: "My Grades" });
});

module.exports = router;
