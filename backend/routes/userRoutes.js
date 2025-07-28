// routes/userRoutes.js
import express from 'express';


import { userAuth } from '../middlewares/authMiddleware.js';
import upload from '../utils/multerConfig.js';
import userController from '../controllers/userController.js';

const router = express.Router();


router.get('/profile', userAuth, userController.getProfile);
router.put('/profile', userAuth, upload.single('profileImage'), userController.updateProfile);
router.put('/password', userAuth, userController.updatePassword);

export default router;
