// routes/authRoutes.js
import express from 'express';


import { userAuth } from '../middlewares/authMiddleware.js';
import authController from '../controllers/authController.js';

const router = express.Router();

// Define user routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/me', userAuth, authController.getAuthUser);
router.post('/refresh-token', authController.refreshAccessToken);
router.post('/logout', authController.logoutUser);

export default router;
