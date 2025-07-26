import express from 'express'
const router = express.Router();

import { userAuth, adminAuth } from '../middlewares/authMiddleware.js';
import adminController from '../controllers/adminController.js';
import upload from '../utils/multerConfig.js';


// Define admin routes
router.get('/users', userAuth, adminAuth, adminController.getUsers);
router.post('/create-user', userAuth, adminAuth, upload.single('profileImage'), adminController.createUser);
router.put('/update-user/:userId', userAuth, adminAuth, upload.single('profileImage'), adminController.updateUser);
router.delete('/delete-user/:userId', userAuth, adminAuth, adminController.hardDeleteUser);
// router.delete('/delete-user/:userId', userAuth, adminAuth, adminController.softDeleteUser);


export default router;