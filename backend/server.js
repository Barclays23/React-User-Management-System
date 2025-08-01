// Import required packages using ESM syntax
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup __dirname and __filename in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Import local modules (after dotenv.config() is fine)
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Initialize Express app
const app = express();

// Middleware to parse JSON requests and cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Replace this with your Vercel frontend URL
const allowedOrigins = [
  'https://react-user-management-23.vercel.app', 
  'https://react-user-management-system-tau.vercel.app', 
  'http://localhost:5173',
];


app.use(cors({
  // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));


// Serve static assets
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// app.use('/avatars', express.static(path.join(__dirname, 'uploads/profile-pics')));
// app.use('/products', express.static(path.join(__dirname, 'uploads/product-images')));
// app.use('/banners', express.static(path.join(__dirname, 'uploads/banner-images')));

// Connect to MongoDB (do this before handling routes ideally)
connectDB();

// Define API routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
