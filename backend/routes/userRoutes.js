// routes/userRoutes.js
import express from 'express';


import { userAuth } from '../middlewares/authMiddleware.js';
import upload from '../utils/multerConfig.js';
import userController from '../controllers/userController.js';

const router = express.Router();

// Define user routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/me', userAuth, userController.getAuthUser);
router.get('/profile', userAuth, userController.getProfile);
router.put('/profile', userAuth, upload.single('profileImage'), userController.updateProfile);
router.put('/password', userAuth, userController.updatePassword);
router.post('/refresh-token', userController.refreshAccessToken);
router.post('/logout', userController.logoutUser);

export default router;
