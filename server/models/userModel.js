const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  handles: {
    codechef: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    hackerrank: { type: String, default: '' },
    hackerearth: { type: String, default: '' },
    atcoder: { type: String, default: '' },
  },
  ratings: {
    type: Map,
    of: Number,
    default: {}
  },
  maxRating: {
    type: Number,
    default: 0
  },
  totalQuestionsSolved: {
    type: Number,
    default: 0
  },
  questionsSolvedByPlatform: {
    codechef: { type: Number, default: 0 },
    codeforces: { type: Number, default: 0 },
    leetcode: { type: Number, default: 0 },
    hackerrank: { type: Number, default: 0 },
    hackerearth: { type: Number, default: 0 },
    atcoder: { type: Number, default: 0 }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  accountCreated: {
    type: Date,
    default: Date.now
  },
  streak: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String
  }],
  activityLogs: [{
    type: String
  }],
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium', 'expired'],
    default: 'free'
  },
  refreshToken: {
    type: String,
    default: ''
  },
  resetPasswordToken: {
    type: String,
    default: ''
  },
  resetPasswordExpire: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String
  },
  otpExpires: {
    type: Date
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
