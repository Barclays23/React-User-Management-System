import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { removeCredentials } from '../../redux/slices/authSlice';
import apiCalls, { decodeToken } from '../../utils/api';
import { useEffect, useState } from 'react';

// Navbar component for navigation
function Navbar() {
   const { isAuthenticated, user, accessToken } = useSelector((state) => state.auth);

   const [decodedToken, setDecodedToken] = useState(null);


   // only to see the full details of the token. for debugging purpose
   useEffect(() => {
      if (accessToken) {
         const decoded = decodeToken(accessToken);
         setDecodedToken(decoded);
         // console.log('DECODED ACCESSTOKEN :', decoded);
      }
   }, [accessToken]);

   const formatDat = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleString(); // Convert UNIX to readable format
   };

   const formatDate = (date) => date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
   });


   const currentTime = new Date().toLocaleString();
   
   const dispatch = useDispatch();
   const navigate = useNavigate();

   const handleLogout = async () => {
      try {
         const response = await apiCalls.signOut()
         console.log('response after logout:', response);
         
         dispatch(removeCredentials());
         navigate('/login');
         
      } catch (err) {
         console.log('error in handleLogout: ', err);
         const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again later.';
         toast.error(errorMessage);
      } finally {

      }
   };

   return (
      <nav className="bg-blue-600 text-white p-4 shadow-md">
         <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">User Management</Link>

            <div className="flex space-x-3 items-center">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `px-4 py-2 text-sm font-bold rounded-md transition ${
                          isActive ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-white bg-gray-700 hover:bg-gray-800'
                        }`
                      }
                    >
                      Admin Dashboard
                    </NavLink>
                  )}
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `px-4 py-2 text-sm font-bold rounded-md transition ${
                        isActive ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-white bg-gray-700 hover:bg-gray-800'
                      }`
                    }
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-4 py-2 text-sm font-bold rounded-md transition ${
                        isActive ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-white bg-gray-700 hover:bg-gray-800'
                      }`
                    }
                  >
                    Home
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-mono text-white bg-red-500 hover:bg-red-600 rounded-md transition cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-4 py-2 text-sm font-bold rounded-md transition ${
                        isActive ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-white bg-gray-700 hover:bg-gray-800'
                      }`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `px-4 py-2 text-sm font-mono rounded-md transition ${
                        isActive ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-white bg-gray-700 hover:bg-gray-800'
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `px-4 py-2 text-sm font-mono rounded-md transition ${
                        isActive ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-white bg-gray-700 hover:bg-gray-800'
                      }`
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>

         </div>


         {/* Stylish Debugging Output */}
         {/* {process.env.NODE_ENV === 'development' && (
            
            <div className="container mx-auto mt-4">
               <div className="bg-gray-800 text-gray-100 p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                  <h3 className="font-mono font-bold text-sm mb-2">Debug Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-700 p-2 rounded">
                     <p className="font-semibold">isAuthenticated:</p>
                     <p className= {isAuthenticated ? 'text-green-500': 'text-red-400'}>{JSON.stringify(isAuthenticated)}</p>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                     <p className="font-semibold">accessToken:</p>
                     <p className="text-blue-300 truncate">{accessToken || 'null'}</p>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                     <p className="font-semibold">user:</p>
                     <pre className="text-blue-300 overflow-x-auto">
                        {user?.name} - {user?.email}
                     </pre>
                  </div>
                  </div>
               </div>
            </div>

            
         )}

         {decodedToken && (
            <div className="bg-gray-700 p-2 rounded mt-2">
               <p className="font-semibold mb-1">Decoded Token Info:</p>
               <p><span className="font-mono">Issued At:</span> {formatDate(decodedToken.issuedAt)}</p>
               <p><span className="font-mono">Expires At:</span> {formatDate(decodedToken.expiresAt)}</p>
               <p><span className="font-mono">Is Expired?:</span> {decodeToken.isExpired ? "Yes" : "No"}</p>
               <p><span className="font-mono">Current Time:</span> {currentTime}</p>
            </div>
         )} */}


      </nav>
   );
}

export default Navbar;