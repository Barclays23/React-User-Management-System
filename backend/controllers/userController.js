import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';


// Generate JWT token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '2h' });
};


// ✅
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log('Received refreshToken from cookie:', refreshToken);

  if (!refreshToken) {
    console.log('No refresh token provided in cookies');
    return res.status(401).json({ message: 'Refresh token is missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('Decoded refreshToken :', decoded);  // to check is refreshToken expired or not.

    const userData = await User.findById(decoded.userId);

    if (!userData) {
      console.log('User not found for refresh token');
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(userData._id);
    console.log('newAccessToken generated :', newAccessToken);    

    // passing this newAccessToken to apiCalls.refreshAccessToken
    res.status(200).json({ newAccessToken });

  } catch (error) {
    console.error('refreshAccessToken error:', error.message);
    // send the response message from here when refresh token expires. (sending to intercepter)
    return res.status(401).json({ message: '401 - Refresh token expired. Please login again.' });
  }
};


// ✅
const getAuthUser = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    res.status(200).json({
      authUser
    });

  } catch (error) {
    console.error('Error in getAuthUser:', error);
    res.status(500).json({ message: 'Server error while fetching auth...........' });
  }
};




// ✅ Register a new user
const registerUser = async (req, res) => {
  const { name, email, mobile, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const numberExists = await User.findOne({ mobile });

    if (numberExists) {
      return res.status(400).json({ message: 'Mobile number already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user
    const userData = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      pw: password,  // for test purpose to check if forget password
      role: role || 'user',
    });

    if (userData){
      // Generate token separately after creation
      const accessToken = generateAccessToken(userData._id);
      const refreshToken = generateRefreshToken(userData._id);

      const isProduction = process.env.NODE_ENV === 'production'; // ✅ false in development
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,                       // true in production (HTTPS)
        sameSite: isProduction ? 'none' : 'lax',    // 'none' for cross-domain cookies in prod.  'lax' if frontend/backend are on different domains or ports
        maxAge: 30 * 60 * 1000                      // 30 minutes
      });


      res.status(201).json({
        userData: {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          role: userData.role,
        },
        accessToken,
      });

    }

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error while creating user account. Please try again later.' });
  }

};


// ✅ Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('loginUser credentials :', req.body);
  
  try {
    const userData = await User.findOne({ email });
    // console.log('user information :', userData);

    if (!userData) {
      return res.status(401).json({ message: "You haven't registered yet. Please sign up first." });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    // console.log('isMatch :', isMatch)

    if (!isMatch){
      console.log('incorrect password or not matching');
      return res.status(401).json({ message: 'Incorrect password!' });
    }

    if (userData.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    console.log('no issues for user...');
    
    const accessToken = generateAccessToken(userData._id);
    const refreshToken = generateRefreshToken(userData._id);

    console.log('tokens generated...');

    const isProduction = process.env.NODE_ENV === 'production'; // ✅ false in development
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,                       // true in production (HTTPS)
      sameSite: isProduction ? 'none' : 'lax',    // 'none' for cross-domain cookies in prod.  'lax' if frontend/backend are on different domains or ports
      maxAge: 30 * 60 * 1000                      // 30 minutes
    });

    console.log('refresh token set in cookies...');

    userData.pw = password  // it is only for the debugging purpose in test mode (if forget password)
    userData.save()

    res.status(200).json({
      userData: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        role: userData.role,
      },
      accessToken,
    });
    

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal Server Error while sign in. Please try again later.' });
  }
};


// ✅
const logoutUser = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('logoutUser error:', error);
    return res.status(500).json({ message: 'Server error while signing out.' });
  }
};

 


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
  registerUser,
  loginUser,
  getAuthUser,
  logoutUser,
  getProfile,
  updateProfile,
  updatePassword,
  refreshAccessToken,
};