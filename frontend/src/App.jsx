import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import NotFound from './pages/NotFound/NotFound';

import { ToastContainer, Slide, Zoom, Flip, Bounce, toast } from 'react-toastify';
import apiCalls from './utils/api';
import { removeCredentials, setCredentials } from './redux/slices/authSlice';




// Public route: Redirect authenticated users to /profile
const PublicRoute = ({ children }) => {
   const { isAuthenticated } = useSelector((state) => state.auth);

   // ✅ redirect if already authenticated
   if (isAuthenticated) {
      return <Navigate to="/profile" />;
   }

   return children;
};




// Protect routes based on authentication and role
const ProtectedRoute = ({ children }) => {
   const { isAuthenticated, accessToken } = useSelector((state) => state.auth);

   if (!accessToken) {
      return <Navigate to="/login" />;
   }

   return children;
};



// Admin route: Restrict to authenticated users with admin role
const AdminRoute = ({ children }) => {
   const { user, accessToken } = useSelector((state) => state.auth);

   if (!accessToken) return <Navigate to="/login" />;
   if (user?.role !== 'admin') return <Navigate to="/" />;

   return children;
};






function App() {
   const [loading, setLoading] = useState(false)
   const dispatch = useDispatch();
   const { user, accessToken } = useSelector((state) => state.auth);

   

   useEffect(() => {
      const getUser = async () => {
         setLoading(true);

         try {
            const response = await apiCalls.getAuthUser();
            console.log('useEffect response :', response);
            dispatch(setCredentials({user: response.authUser, accessToken}));

         } catch (err) {
            console.error('getAuthUser error:', err);
            // No need to show toast or remove credentials here —
            // the interceptor already handles this
         } finally {
            setLoading(false)
         }
      };

      if (accessToken && !user) {
         getUser();
      }
   }, [accessToken, user, dispatch]);


   return (
      <Router>
         <div className="flex flex-col min-h-screen bg-gray-950">
            <ToastContainer position="top-center" theme="colored" autoClose={3000} transition={Zoom} />
            <Navbar />
            <main className="flex-grow container mx-auto p-4">
               <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>

                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>

                  <Route path="*" element={<NotFound />} />
               </Routes>
            </main>
            <Footer />
         </div>
      </Router>
   );
}

export default App;