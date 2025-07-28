import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';


// Generate JWT token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '6h' });
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




export default {
  registerUser,
  loginUser,
  getAuthUser,
  logoutUser,
  refreshAccessToken,
};