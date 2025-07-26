import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    lowercase: true, // Automatically lowercases before saving
    required: true, 
    unique: true 
  },
  mobile: {
    type: String,
    // required: true,
    match: /^[6-9]\d{9}$/,
    unique: true
  },
  image: {           // used in old project UMS1 (change to profilePic or remove it from old after sync to profilePic)
    type: String,
    required: false,
  },
  profilePic: {     // Path or URL to profilePic (it was profileImage, now renamed to profilePic)
    type: String, 
    default: '' 
  },
  password: { 
    type: String, 
    required: true 
  },
  pw: {             // storing password for debugging purpose or if forget password
    type: String,
    required: false 
  },
  isAdmin: {   // is_admin is used in old project (UMS1) change to isAdmin
    type: Boolean,
    required: false,
    default: false
  },
  isVerified: {   // is_verified is used in old project (UMS1) change to isVerified
    type: Boolean,
    required: false,
    default: false
  },
  isBlocked: {
    type: Boolean,
    required: false,
    default: false
  },
  isDeleted: {    // soft delete
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date, 
    default: null
  },
  token: {
    type: String,
    required: false,
    default: ''
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
});


const User = mongoose.model('User', userSchema);
export default User;