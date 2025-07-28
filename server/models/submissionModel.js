const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    code: String,
    language: String,
    status: { type: String, enum: ["Success", "Failed"], default: "Failed" },
    runtime: Number,
    memoryUsed: { type: Number, default: 0 },
    submissionTime: { type: Date, default: Date.now },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Submission", submissionSchema);
