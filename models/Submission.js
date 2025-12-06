const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true }, // e.g., Assignment title
  description: { type: String },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String }, // cloudinary public id for deletion if needed
  filename: { type: String },
  submittedAt: { type: Date, default: Date.now },
  graded: { type: Boolean, default: false },
  grade: { type: String }, // or number
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gradedAt: { type: Date },
});

module.exports = mongoose.model("Submission", submissionSchema);
