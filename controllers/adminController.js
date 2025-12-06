const Submission = require("../models/Submission");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { cloudinary } = require("../middlewares/upload");

exports.listSubmissions = async (req, res) => {
  const submissions = await Submission.find()
    .populate("student")
    .sort("-submittedAt");
  res.render("admin/dashboard", { title: "Admin Dashboard", submissions });
};

exports.viewSubmission = async (req, res) => {
  const sub = await Submission.findById(req.params.id).populate("student");
  if (!sub) {
    req.flash("error", "Submission not found");
    return res.redirect("/admin");
  }
  res.render("admin/viewSubmission", {
    title: "Admin Dashboard",
    submission: sub,
  });
};

exports.postGrade = async (req, res) => {
  const { id } = req.params;
  const { grade, feedback } = req.body;
  const adminId = req.session.userId;
  const submission = await Submission.findById(id).populate("student");
  if (!submission) {
    req.flash("error", "Not found");
    return res.redirect("/admin");
  }

  submission.grade = grade;
  submission.feedback = feedback;
  submission.graded = true;
  submission.gradedBy = adminId;
  submission.gradedAt = new Date();
  await submission.save();

  // send email to student
  const html = `
    <p>Dear ${submission.student.name},</p>
    <p>Your submission titled "<strong>${
      submission.title
    }</strong>" has been graded.</p>
    <p>Grade: <strong>${grade}</strong></p>
    ${feedback ? `<p>Feedback: ${feedback}</p>` : ""}
    <p><a href="${
      process.env.BASE_URL
    }/dashboard/submissions">Login to view details</a></p>
  `;
  await sendEmail({
    to: submission.student.email,
    subject: "Your assignment has been graded",
    html,
  });

  req.flash("success", "Graded and student notified");
  res.redirect("/admin/submissions/" + id);
};

// optional: delete submission (admin)
exports.deleteSubmission = async (req, res) => {
  const { id } = req.params;
  const submission = await Submission.findById(id);
  if (!submission) {
    req.flash("error", "Not found");
    return res.redirect("/admin");
  }
  // delete from cloudinary if public id present
  try {
    if (submission.filePublicId) {
      await cloudinary.uploader.destroy(submission.filePublicId, {
        resource_type: "auto",
      });
    }
  } catch (e) {
    console.warn("cloudinary delete failed", e.message);
  }
  await submission.remove();
  req.flash("success", "Submission removed");
  res.redirect("/admin");
};

exports.dashboard = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("student") // make sure `student` references User model
      .lean();
    res.render("admin/dashboard", { title: "Admin Dashboard", submissions });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
};
