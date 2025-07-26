import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';



// ✅  Get all users (exept marked as deleted)
const getUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    const query = {
      isDeleted: false,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
        ],
      }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // console.log('users :', users);
    
    res.status(200).json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('getUsers error:', error.message);
    res.status(500).json({ message: 'Internal server error while fetching users' });
  }
};


// ✅ Create a new user
const createUser = async (req, res) => {
  const { name, email, mobile, role } = req.body;
  // console.log('body received in createUser:', req.body);
  // console.log('image received in createUser:', req.file);
  // console.log('req.headers["content-type"]:', req.headers['content-type']);

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email address already exists' });
    }

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({ message: 'Mobile number already exists' });
    }

    let uploadedImageUrl = '';
    if (req.file) {
      // console.log('file und');
      
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        'user-management-system/user-images'  // folder path (project-name/folder-name)
      );

      // console.log('Cloudinary upload result:', uploadResult);
      uploadedImageUrl = uploadResult.secure_url;
      console.log('image uploaded to cloudinary');
    }

    const defaultPassword = 'HelloWorld@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUserData = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      pw: defaultPassword, // for test purpose only
      role: role || 'user',
      // profilePic: req.file ? req.file.filename : '',  if storing in local storage
      profilePic: uploadedImageUrl ? uploadedImageUrl : '',  // cloudinary url link
    });

    console.log('newUser created:', newUserData);

    res.status(201).json({newUserData, message: 'New user account created successfully.'});

  } catch (error) {
    console.error('createUser error:', error.message);
    res.status(500).json({ message: 'Server error while creating new user' });
  }
};



// ✅ Update a user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, mobile, role } = req.body;
    const requester = req.user;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    console.log('superAdminEmail :', superAdminEmail);

    const updates = {
      name,
      email,
      mobile,
    };

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User data not found to update' });
    }

    // Prevent editing super admin by anyone else
    if (userData.email === superAdminEmail && requester.email !== superAdminEmail) {
      return res.status(403).json({ message: 'Access denied! Only the super admin can update their own details.' });
    }

    // Prevent admin from editing another admin
    if (
      (userData.role === 'admin' || userData.isAdmin) &&
      requester._id.toString() !== userData._id.toString() &&
      requester.role !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Access denied! Admins cannot edit other admin accounts.' });
    }

    // Only super admin is allowed to change roles
    if (requester.email === superAdminEmail && role) {
      updates.role = role;
    } else if (role && role !== userData.role) {
      return res.status(403).json({ message: 'Access denied! Only the super admin can change user roles.' });
    }

    // Check for email conflict
    const existingUserByEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already in use. Please use a different email.' });
    }

    // Check for mobile conflict
    const existingUserByPhone = await User.findOne({ mobile, _id: { $ne: userId } });
    if (existingUserByPhone) {
      return res.status(400).json({ message: 'Mobile number already in use. Please use a different number.' });
    }


    if (req.file) {
      // console.log('file und');

      // updates.profilePic = req.file.filename;  // if storing to local storage
      
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        'user-management-system/user-images'  // file path (project-name/folder-name)
      );

      console.log('Cloudinary upload result:', uploadResult);
      console.log('image uploaded to cloudinary');
      updates.profilePic = uploadResult.secure_url;  // cloudinary url link
    }

    Object.assign(userData, updates);
    await userData.save();

    res.json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error('updateUser error:', error.message);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};



// ✅ Delete a user (HARD DELETE)
const hardDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requester = req.user;

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (requester._id.toString() === userId) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User does not exist or already deleted.' });
    }

    if (userToDelete.email === superAdminEmail) {
      return res.status(403).json({ message: 'Access denied! You cannot delete the super admin.' });
    }

    if ((userToDelete.role === 'admin' || userToDelete.isAdmin) && requester.email !== superAdminEmail) {
      return res.status(403).json({ message: 'Access denied! Only the super admin can delete another admin.' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User has been permanently deleted.' });
  } catch (error) {
    console.error('Hard delete error:', error);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};



// ✅ Delete a user (SOFT DELETE)
const softDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requester = req.user;

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (requester._id.toString() === userId) {
      return res.status(400).json({ message: "Admins cannot delete their own account." });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User does not exist or already deleted.' });
    }

    if (userToDelete.email === superAdminEmail) {
      return res.status(403).json({ message: 'Access denied! You cannot delete the super admin.' });
    }

    if ((userToDelete.role === 'admin' || userToDelete.isAdmin) && requester.email !== superAdminEmail) {
      return res.status(403).json({ message: 'Access denied! Only the super admin can delete another admin.' });
    }

    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({ message: 'User has been marked as deleted.' });

  } catch (error) {
    console.error('Soft delete error:', error);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};




export default { 
  getUsers, 
  createUser, 
  updateUser, 
  hardDeleteUser,
  softDeleteUser
};