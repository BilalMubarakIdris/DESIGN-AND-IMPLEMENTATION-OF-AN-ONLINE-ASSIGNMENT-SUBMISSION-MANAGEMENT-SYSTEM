const Submission = require("../models/Submission");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
exports.getSubmitForm = (req, res) => {
  res.render("student/submit");
};

exports.postSubmit = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");
    const userId = req.session.userId;
    const { title, description } = req.body;
    const fileUrl = req.file.path; // multer-storage-cloudinary sets path to url
    const filePublicId =
      req.file.filename || req.file.public_id || req.file.publicId;
    const filename = req.file.originalname;

    const submission = new Submission({
      student: userId,
      title,
      description,
      fileUrl,
      filePublicId,
      filename,
    });
    await submission.save();

    // notify admin(s) by email
    const adminUsers = await User.find({ role: "admin" });
    const student = await User.findById(userId);
    const subject = `New assignment submitted by ${student.name}`;
    const link = `${process.env.BASE_URL}/admin/submissions/${submission._id}`;
    const html = `
      <p>Student: ${student.name} (${student.regNo})</p>
      <p>Department: ${student.department} | Year: ${student.year} | Semester: ${student.semester}</p>
      <p>Title: ${submission.title}</p>
      <p><a href="${link}">View submission (admin)</a></p>
    `;
    const toList = adminUsers.map((a) => a.email).join(","); // send to all admins
    await sendEmail({ to: toList, subject, html });

    req.flash("success", "Assignment submitted. Admin was notified.");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/dashboard/submit");
  }
};

exports.mySubmissions = async (req, res) => {
  const subs = await Submission.find({ student: req.session.userId }).sort(
    "-submittedAt"
  );
  res.render("student/submissions", {
    submissions: subs,
    title: "Your Submissions",
  });
};
