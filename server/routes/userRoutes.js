const express = require('express');
const singleUpload = require('../middlewares/multer.js');
const { 
  registerUser, 
  loginUser, 
  updateUser, 
  updateProfilePicture,
  getUserProfile,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  removeProfilePicture
  ,updateThemePreference
} = require('../controllers/userControllers.js');
const User = require('../models/userModel.js');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile/:id', updateUser);
router.put('/profile-picture/:id', singleUpload, updateProfilePicture);
router.delete('/profile-picture/:id', removeProfilePicture);
router.get('/profile/:id', getUserProfile);

// Email Verification Routes
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/theme', updateThemePreference);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Admin routes
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}).select('-password -refreshToken -resetPasswordToken');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/toggle-admin/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.isAdmin = !user.isAdmin;
    user.role = user.isAdmin ? 'admin' : 'user';
    await user.save();
    
    res.json({ message: "User role updated successfully", user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
