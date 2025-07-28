import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';



// ✅ Get user profile
const getProfile = async (req, res) => {
  try {
    console.log('User in getProfile:', req.user.email);

    // Ensure req.user exists (added by protect middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    const userData = req.user;  // already excluded password from middleware
    res.status(200).json(userData);
    
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};


// ✅ Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const {name, email, mobile, phone} = req.body;
    console.log('image :', req.file);

    // Check if user with email already exists
    const existingUserByEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use. Please use a different email or login.'
      });
    }

    // Check if user with phone number already exists
    const existingUserByPhone = await User.findOne({ mobile, _id: { $ne: userId } });
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number already in use. Please use a different number or login.'
      });
    }

    // Find user by ID
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    const updates = {
      name : name,
      email : email,
    }

    if (req.file) {
      // updates.profilePic = req.file.filename;  // if storing to local storage
      
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        'user-management-system/user-images'  // file path (project-name/folder-name)
      );

      console.log('Cloudinary upload result:', uploadResult);
      console.log('image uploaded to cloudinary');
      updates.profilePic = uploadResult.secure_url;  // cloudinary url link
    }

    // Apply updates to userData
    Object.assign(userData, updates);

    // Save the updated user
    const updatedUser = await userData.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      profilePic: updatedUser.profilePic,
      role: updatedUser.role,
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};


// ✅ Update password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const userData = await User.findById(req.user._id);
    if (!userData) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userData.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword= await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword
    userData.pw = newPassword  // for test purpose only

    await userData.save();  

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
};




export default {
  getProfile,
  updateProfile,
  updatePassword,
};