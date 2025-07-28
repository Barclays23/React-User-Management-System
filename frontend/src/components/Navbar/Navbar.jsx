import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { removeCredentials } from '../../redux/slices/authSlice';
import apiCalls from '../../utils/api';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMenu, FiX } from 'react-icons/fi';

function Navbar() {
   const { isAuthenticated, user, accessToken } = useSelector((state) => state.auth);
   const dispatch = useDispatch();
   const navigate = useNavigate();

   const [isMenuOpen, setIsMenuOpen] = useState(false);

   const handleLogout = async () => {
      try {
         await apiCalls.signOut();
         dispatch(removeCredentials());
         toast.success('Signed out successfully!');
         navigate('/login');
      } catch (err) {
         const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again later.';
         toast.error(errorMessage);
      }
   };

   const navLinkClasses = ({ isActive }) =>
    `block px-4 py-2 text-sm rounded-md transition ${
        isActive
          ? 'text-white bg-blue-600 hover:bg-blue-700'
          : 'text-white bg-gray-700 hover:bg-gray-800'
    }`;

   return (
      <nav className="bg-blue-600 text-white p-4 shadow-md">
         <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">
               User Management
            </Link>

            {/* Hamburger Button */}
            <div className="sm:hidden">
               <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white text-2xl focus:outline-none"
               >
                  {isMenuOpen ? <FiX /> : <FiMenu />}
               </button>
            </div>

            {/* Links for desktop */}
            <div className="hidden sm:flex space-x-3 items-center">
               {isAuthenticated ? (
                  <>
                     {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClasses}>Admin Dashboard</NavLink>}
                     <NavLink to="/profile" className={navLinkClasses}>Profile</NavLink>
                     <NavLink to="/" className={navLinkClasses}>Home</NavLink>
                     <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-mono text-white bg-red-500 hover:bg-red-600 rounded-md transition"
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <>
                     <NavLink to="/" className={navLinkClasses}>Home</NavLink>
                     <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
                     <NavLink to="/register" className={navLinkClasses}>Register</NavLink>
                  </>
               )}
            </div>
         </div>

         {/* Mobile Menu */}
         {isMenuOpen && (
            <div className="sm:hidden mt-3 space-y-2 px-4">
               {isAuthenticated ? (
                  <>
                     {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Admin Dashboard</NavLink>}
                     <NavLink to="/profile" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
                     <NavLink to="/" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                     <button
                        onClick={() => {
                           setIsMenuOpen(false);
                           handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm font-mono text-white bg-red-500 hover:bg-red-600 rounded-md transition"
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <>
                     <NavLink to="/" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                     <NavLink to="/login" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                     <NavLink to="/register" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Register</NavLink>
                  </>
               )}
            </div>
         )}
      </nav>
   );
}

export default Navbar;
