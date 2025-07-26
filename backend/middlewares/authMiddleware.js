// authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


// Middleware to protect routes
const userAuth = async (req, res, next) => {
   console.log('checking userAuth middleware');
   
   // Check for token in Authorization header
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
         let token = req.headers.authorization.split(' ')[1];  // token that set in header from api.js
         console.log('Token received in middleware:', token);
         // Verify token
         const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
         console.log('Decoded token in middleware:', decoded);
         // Attach user to request object

         const currentUser = await User.findById(decoded.userId).select('-password');  // find data except password
         if (!currentUser) {
            return res.status(401).json({ message: 'Not authorized, user not found in database.' });
         }
         req.user = currentUser
         // console.log('req.user :', currentUser);
         next();

      } catch (error) {
         console.error('Token verification error in middleware:', error.message);
         res.status(401).json({ message: 'Not authorized, access token is expired or failed.' });
      }

   } else {
      console.log('No Authorization header or invalid format');
      res.status(401).json({ message: 'Authentication required. No access token provided.' });
   }
};



// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
   if (req.user && req.user.role === 'admin') {
      next();
   } else {
      res.status(403).json({ message: 'Not authorized as admin' });
   }
};


export { userAuth, adminAuth };
