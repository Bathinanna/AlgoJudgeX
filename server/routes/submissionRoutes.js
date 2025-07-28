const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Submission = require("../models/submissionModel.js");
const Question = require("../models/questionModel.js"); 

// ✅ Route 1: Get all submissions with full details for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.params.userId }).populate("questionId");

    const detailed = submissions.map((s) => ({
      questionId: s.questionId._id,
      questionTitle: s.questionId.title,
      status: s.status,
      code: s.code,
      language: s.language,
      runtime: s.runtime,
      createdAt: s.createdAt,
    }));

    res.json(detailed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Route 2: Get short status map for user submissions
router.get("/status-map/:userId", async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.params.userId });
    const mapped = submissions.map((s) => ({
      questionId: s.questionId,
      status: s.status,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Route 3: Get submission status for a user-question pair
router.get("/:questionId/user/:userId", async (req, res) => {
  try {
    const submission = await Submission.findOne({
      userId: req.params.userId,
      questionId: req.params.questionId,
    });

    if (!submission) {
      return res.json({ status: "Not Attempted" });
    }

    res.json({ status: submission.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Route 4: Submit or update code submission
router.post("/", async (req, res) => {
  const { userId, questionId, code, language, status, runtime } = req.body;

  try {
    const existing = await Submission.findOne({ userId, questionId });

    if (existing) {
      existing.code = code;
      existing.language = language;
      existing.status = status;
      existing.runtime = runtime;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json({ message: "Submission updated", submission: existing });
    }

    const newSubmission = new Submission({
      userId,
      questionId,
      code,
      language,
      status,
      runtime,
    });

    await newSubmission.save();
    res.status(201).json({ message: "Submission saved", submission: newSubmission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/submissions/stats/:userId
router.get("/stats/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const submissions = await Submission.find({ userId });
    const total = submissions.length;
    const success = submissions.filter(s => s.status === "Success").length;
    const failed = submissions.filter(s => s.status === "Failed").length;
    const avgRuntime = (
      submissions.reduce((sum, s) => sum + (s.runtime || 0), 0) / total
    ).toFixed(2);

    const langCount = {};
    submissions.forEach(s => {
      langCount[s.language] = (langCount[s.language] || 0) + 1;
    });
    const mostUsedLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    res.json({
      total,
      success,
      failed,
      successRate: ((success / total) * 100).toFixed(1),
      mostUsedLang,
      avgRuntime,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/submissions/heatmap/:userId - Add heatmap data
router.get("/heatmap/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const submissionsPerDay = await Submission.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: {
            $min: {
              $cond: [
                { $gt: ['$count', 4] },
                4,
                '$count'
              ]
            }
          }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json(submissionsPerDay);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
