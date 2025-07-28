/**
 * Utility for OTP generation, storage and verification
 */
const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('./sendEmail');

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to user document with expiration time (10 minutes)
const saveOTP = async (userId, otp) => {
  try {
    // Hash the OTP before saving for security
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Find the user and update with OTP details
    await User.findByIdAndUpdate(userId, {
      otpCode: hashedOTP,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      isVerified: false
    });

    return true;
  } catch (error) {
    console.error('Error saving OTP:', error);
    throw new Error('Could not save OTP');
  }
};

// Verify OTP provided by the user
const verifyOTP = async (userId, otp) => {
  try {
    // Find user with unexpired OTP
    const user = await User.findOne({ 
      _id: userId,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return { 
        isValid: false, 
        message: 'OTP has expired or is invalid' 
      };
    }

    // Hash the provided OTP to compare with stored hash
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    if (user.otpCode !== hashedOTP) {
      return { 
        isValid: false, 
        message: 'Invalid OTP' 
      };
    }

    // OTP is valid, mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { 
      isValid: true, 
      message: 'Email successfully verified' 
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Error verifying OTP');
  }
};

// Send OTP via email
const sendOTPEmail = async (user, otp) => {
  try {
    const message = `
      <h2>Email Verification</h2>
      <p>Thank you for registering with AlgoJudgeX!</p>
      <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not register for AlgoJudgeX, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'AlgoJudgeX - Email Verification Code',
      html: message,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send verification email');
  }
};

// Generate and send OTP in one function
const generateAndSendOTP = async (user) => {
  try {
    const otp = generateOTP();
    await saveOTP(user._id, otp);
    await sendOTPEmail(user, otp);
    return true;
  } catch (error) {
    console.error('Error in generateAndSendOTP:', error);
    throw new Error('Failed to generate and send OTP');
  }
};

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP,
  sendOTPEmail,
  generateAndSendOTP
};
