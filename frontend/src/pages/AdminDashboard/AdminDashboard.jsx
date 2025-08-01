import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IoClose, IoCameraOutline } from 'react-icons/io5';
import apiCalls from '../../utils/api';
import { toast } from 'react-toastify';

import Swal from 'sweetalert2';
import RippleSpinner from '../../components/LoadingSpinners/RippleSpinner';


function AdminDashboard() {
   const { isAuthenticated, user, accessToken } = useSelector((state) => state.auth);

   const [allUsers, setAllUsers] = useState([]);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const itemsPerPage = 10;

   // for adding / editing
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [mobile, setMobile] = useState('');
   // const [password, setPassword] = useState('');
   const [role, setRole] = useState('user');
   const [profileImage, setProfileImage] = useState(null);
   const [imagePreview, setImagePreview] = useState(null);

   const [nameError, setNameError] = useState('');
   const [emailError, setEmailError] = useState('');
   const [mobileError, setMobileError] = useState('');
   const [imageError, setImageError] = useState('');
   // const [passwordError, setPasswordError] = useState('');

   
   const [search, setSearch] = useState('');
   const [editId, setEditId] = useState(null);
   const [showModal, setShowModal] = useState(false);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   

   useEffect(() => {
      const fetchUsers = async () => {
         try {
            const res = await apiCalls.getUsers({ search, page, limit: itemsPerPage });
            
            setAllUsers(res.users);
            setTotalPages(res.totalPages);
         } catch (err) {
            console.error('Error in fetchUsers:', err);
            setError(err.message);
         }
      };
      fetchUsers();
   }, [search, page]);



   const validateForm = () => {
      let isValid = true;

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      // const trimmedPassword = password.trim();
      const trimmedMobile = mobile.trim();

      // Name validation
      const nameRegex = /^[a-zA-Z][a-zA-Z .'-]*$/;
      if (!trimmedName) {
         setNameError('Name is required.');
         isValid = false;
      } else if (trimmedName.length < 5) {
         setNameError('Name must be at least 5 characters long.');
         isValid = false;
      } else if (!nameRegex.test(trimmedName)) {
         setNameError('Name should contain only letters and can include spaces, dots, hyphens.');
         isValid = false;
      }  else if (trimmedName.length > 25) {
         setNameError('Name should not exceed 25 characters.');
         isValid = false;
      } else {
         setNameError('');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail) {
         setEmailError('Email is required.');
         isValid = false;
      } else if (!emailRegex.test(trimmedEmail)) {
         setEmailError('Please enter a valid email address.');
         isValid = false;
      } else {
         setEmailError('');
      }

      // Mobile validation
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!trimmedMobile) {
         setMobileError('Mobile number is required.');
         isValid = false;
      } else if (!mobileRegex.test(trimmedMobile)) {
         setMobileError('This is an invalid mobile number. Please enter a valid number.');
         isValid = false;
      } else if (trimmedMobile.length != 10) {
         setMobileError('Enter a 10-digit mobile number.');
         isValid = false;
      } else {
         setMobileError('');
      }

      // Password validation only if creating a user
      // if (!editId) {
      //    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,20}$/;
      //    if (!trimmedPassword) {
      //       setPasswordError('Password is required.');
      //       isValid = false;
      //    } else if (!passwordRegex.test(trimmedPassword)) {
      //       setPasswordError('Password must be 8–20 characters long and include uppercase, lowercase, number, and special character.');
      //       isValid = false;
      //    } else {
      //       setPasswordError('');
      //    }
      // } else {
      //    setPasswordError('');
      // }

      return isValid;
   };


   const handleCreateOrUpdate = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const formData = new FormData();
      console.log('formatName(name):', formatName(name));
      
      formData.append('name', formatName(name));
      formData.append('email', email.toLowerCase());
      formData.append('mobile', mobile);
      // formData.append('password', password);
      formData.append('role', role);
      if (profileImage) {
         formData.append('profileImage', profileImage);
      }
      // console.log('profileImage:', profileImage);

      try {
         setLoading(true);

         const response = editId
            ? await apiCalls.updateUser(editId, formData)
            : await apiCalls.createUser(formData);

         // console.log('response after creating / updating the user:', response)
         
         toast.success(response.message || 'New user created');
         
         const updatedUsers = await apiCalls.getUsers({ search, page, limit: itemsPerPage });
         // console.log('updatedUsers in handleCreateOrUpdate:', updatedUsers);
         setAllUsers(updatedUsers.users);
         setTotalPages(updatedUsers.totalPages);
         resetForm();

      } catch (err) {
         console.log('error in handleCreateOrUpdate: ', err);
         const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again later.';
         toast.error(errorMessage);

      } finally {
         setLoading(false);
      }
   };


   function formatName(name) {
      return name
         .replace(/\./g, ' ') // Replace periods with spaces
         .trim()
         .split(/\s+/) // Split by whitespace
         .map(part => 
            part
            .split("'") // Split by apostrophe
            .map(sub => 
               sub ? sub[0].toUpperCase() + sub.slice(1).toLowerCase() : ''
            )
            .join("'") // Rejoin apostrophe parts
         )
         .join(' ');
   }



   const resetForm = () => {
      setEditId(null);
      setName('');
      setEmail('');
      setMobile('');
      // setPassword('');
      setRole('user');
      setProfileImage(null);
      setImagePreview(null);
      setShowModal(false);


      // ✅ Clear all error messages
      setNameError('');
      setEmailError('');
      setMobileError('');
      setImageError('');
      // setPasswordError('');

   };


   const handleEdit = (user) => {
      console.log('handle edit working');
      
      setName(user.name);
      setEmail(user.email);
      setMobile(user.mobile || '');
      setRole(user.role);
      setEditId(user._id);

      if (user.profilePic) { // if existing profile pic
         setImagePreview(user.profilePic || `http://localhost:5000/uploads/profile-pics/${user.profilePic}`);
         setProfileImage(null); // reset file input
      } else {
         setImagePreview(null);
         setProfileImage(null);
      }

      setShowModal(true);
   };


   const handleDelete = async (id) => {
      const result = await Swal.fire({
         title: 'Are you sure?',
         text: 'This action will permanently delete the user.',
         background: '#2d3748',
         color: 'white',
         showCancelButton: true,
         confirmButtonColor: '#d33',
         cancelButtonColor: '#4a5568',
         confirmButtonText: 'Confirm',
      });

      if (result.isConfirmed) {
         setLoading(true);

         try {
            const response = await apiCalls.deleteUser(id);
            console.log('response after deleteUser:', response)
            toast.success(response.message || 'User has been deleted successfully');

            setAllUsers(allUsers.filter((user) => user._id !== id));
            // setAllUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));

         } catch (err) {
            const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again later.';
            toast.error(errorMessage);

         } finally {
            setLoading(false);
         }
      }
   }



   if (loading) {
      return <RippleSpinner/>
   }



   return (
      <div className="min-h-screen px-2 sm:px-4 md:px-6 lg:px-8 py-3">
         <div className="max-w-7xl mx-auto">
            <div className="mb-6">
               <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-400 my-6">
               Admin Dashboard
               </h2>
            </div>

            <div className="bg-gradient-to-b from-blue-200 to-gray-700 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
               <div className="text-right mb-6">
               <button
                  onClick={() => setShowModal(true)}
                  className="text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
               >
                  Create User
               </button>
               </div>

               {error && (
               <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg text-sm">
                  <p>{error}</p>
               </div>
               )}

               <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4">
               User Management
               </h3>

               {/* Search Field */}
               <div className="mb-6">
               <div className="relative">
                  <input
                     type="text"
                     placeholder="Search users by name or email..."
                     value={search}
                     onChange={(e) => {
                     setSearch(e.target.value);
                     setPage(1);
                     }}
                     className="w-full p-2.5 sm:p-3 pl-10 border border-gray-400 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-sm sm:text-base"
                  />
                  <svg
                     className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                     />
                  </svg>
               </div>
               </div>

               {/* Pagination */}
               <div className="flex justify-center items-center gap-2 text-sm sm:text-base mb-6">
               <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-1 sm:py-2 bg-gray-700 hover:bg-gray-800 text-white rounded disabled:opacity-50"
               >
                  Prev
               </button>
               <span className="text-gray-100 bg-gray-800 rounded px-3 py-1">
                  Page {page} of {totalPages}
               </span>
               <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-1 sm:py-2 bg-gray-700 hover:bg-gray-800 text-white rounded disabled:opacity-50"
               >
                  Next
               </button>
               </div>


               {/* Table */}
               <div className="w-full overflow-x-auto text-xs sm:text-sm mb-8">
                  <table className="w-full min-w-[600px] sm:min-w-full divide-y divide-gray-700 bg-gray-900 rounded-lg overflow-hidden text-left">
                     <thead className="bg-gray-900 text-xs sm:text-sm">
                        <tr>
                        <th className="px-3 sm:px-4 py-2 text-gray-300 whitespace-nowrap">Image</th>
                        <th className="px-3 sm:px-4 py-2 text-gray-300 whitespace-nowrap">Name</th>
                        <th className="px-3 sm:px-4 py-2 text-gray-300 whitespace-nowrap">Email</th>
                        <th className="px-3 sm:px-4 py-2 text-center text-gray-300 whitespace-nowrap">Mobile</th>
                        <th className="px-3 sm:px-4 py-2 text-center text-gray-300 whitespace-nowrap">Role</th>
                        <th className="px-3 sm:px-4 py-2 text-center text-gray-300 whitespace-nowrap">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-700">
                        {allUsers.map((user) => (
                        <tr
                           key={user._id}
                           className="bg-gray-800 hover:bg-gray-900 transition"
                        >
                           <td className="px-3 sm:px-4 py-3">
                              <img
                              src={
                                 user.profilePic
                                    ? user.profilePic ||
                                    `http://localhost:5000/uploads/profile-pics/${user.profilePic}`
                                    : '/default-avatar.png'
                              }
                              alt={user.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-300"
                              />
                           </td>
                           <td className="px-3 sm:px-4 py-3 text-gray-100 font-medium min-w-[150px] break-words">
                           {user.name}
                           </td>
                           <td className="px-3 sm:px-4 py-3 text-gray-400 min-w-[150px]">
                              {user.email}
                           </td>
                           <td className="px-3 sm:px-4 py-3 text-gray-400 text-center">
                              {user.mobile || '-'}
                           </td>
                           <td className="px-3 sm:px-4 py-3 text-center">
                              <span
                              className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                                 user.role === 'admin'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-green-600 text-white'
                              }`}
                              >
                              {user.role}
                              </span>
                           </td>
                           <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                 <button
                                    onClick={() => handleEdit(user)}
                                    className="text-[10px] sm:text-xs bg-indigo-500 hover:bg-indigo-700 text-white px-2 py-1 rounded-full"
                                 >
                                    Edit
                                 </button>
                                 <button
                                    onClick={() => handleDelete(user._id)}
                                    className="text-[10px] sm:text-xs bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded-full"
                                 >
                                    Delete
                                 </button>
                              </div>
                           </td>
                        </tr>
                        ))}
                     </tbody>
                  </table>

                  {allUsers.length === 0 && (
                     <div className="text-center py-6 text-gray-400 bg-gray-900 text-sm">
                        No users found
                     </div>
                  )}
               </div>


               {/* Card List */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
               {allUsers.map((user) => (
                  <div
                     key={user._id}
                     className="bg-gray-800 hover:bg-gray-900 rounded-xl shadow-md p-4 flex flex-col items-center text-center transition transform hover:scale-105"
                  >
                     <img
                     src={
                        user.profilePic
                           ? user.profilePic ||
                           `http://localhost:5000/uploads/profile-pics/${user.profilePic}`
                           : "/default-avatar.png"
                     }
                     alt={user.name}
                     className="w-20 h-20 rounded-full object-cover border-4 border-blue-400 mb-3"
                     />
                     <h4 className="text-base sm:text-lg font-semibold text-white">
                     {user.name}
                     </h4>
                     <p className="text-sm text-gray-400">{user.email}</p>
                     <p className="text-sm text-gray-400">{user.mobile || "-"}</p>
                     <span
                     className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                           ? "bg-purple-600 text-white"
                           : "bg-green-600 text-white"
                     }`}
                     >
                     {user.role}
                     </span>
                     <div className="mt-4 flex gap-2">
                     <button
                        onClick={() => handleEdit(user)}
                        className="bg-indigo-600 hover:bg-indigo-800 text-white px-3 py-1 rounded-full text-sm"
                     >
                        Edit
                     </button>
                     <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm"
                     >
                        Delete
                     </button>
                     </div>
                  </div>
               ))}
               </div>

               {/* Modal (Create & Edit) */}
               {showModal && (
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                     <div className="bg-gray-900 text-gray-100 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 my-10">
                        <div className="p-4 sm:p-6">
                           <div className="flex justify-between items-center mb-3">
                              <h3 className="text-xl font-semibold text-white">
                                 {editId ? "Edit User" : "Create New User"}
                              </h3>
                              <button
                                 onClick={resetForm}
                                 className="text-gray-400 hover:text-white transition-colors"
                              >
                                 <IoClose className="w-6 h-6 cursor-pointer" />
                              </button>
                           </div>

                           <form onSubmit={handleCreateOrUpdate} className="space-y-3">
                              {/* Profile Image */}
                              <div className="flex flex-col items-center">
                                 <div className="relative w-20 h-20 mb-2">
                                    <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden ring-2 ring-gray-600">
                                       {imagePreview ? (
                                          <img
                                             src={imagePreview}
                                             alt="Preview"
                                             className="w-full h-full object-cover"
                                          />
                                       ) : (
                                          <svg
                                             className="w-10 h-10 text-gray-400"
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                             />
                                          </svg>
                                       )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-gray-800 border border-gray-600 rounded-full p-1.5 shadow cursor-pointer hover:bg-gray-900 transition">
                                       <IoCameraOutline className="w-4 h-4 text-white" />
                                       <input
                                          type="file"
                                          onChange={(e) => {
                                             const file = e.target.files[0];
                                             if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                   setImageError('Image size should be less than 5MB.');
                                                   setProfileImage(null);
                                                   setImagePreview(null);
                                                   return;
                                                }
                                                setImageError('');
                                                setProfileImage(file);
                                                setImagePreview(URL.createObjectURL(file));
                                             }
                                          }}
                                          className="hidden"
                                          accept="image/*"
                                       />
                                    </label>
                                 </div>
                                 {imageError ? (
                                    <p className="text-xs text-red-400 mt-1">{imageError}</p>
                                 ) : (
                                    <span className="text-xs text-gray-400">Upload Profile Photo</span>
                                 )}
                              </div>

                              {/* Name */}
                              <div>
                                 <label className="block text-xs font-medium text-gray-300 mb-1">Name</label>
                                 <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter name"
                                 />
                                 {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
                              </div>

                              {/* Email */}
                              <div>
                                 <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                                 <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter email"
                                 />
                                 {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
                              </div>

                              {/* Mobile */}
                              <div>
                                 <label className="block text-xs font-medium text-gray-300 mb-1">Mobile</label>
                                 <input
                                    type="text"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full p-2.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter 10-digit mobile"
                                 />
                                 {mobileError && <p className="text-xs text-red-400 mt-1">{mobileError}</p>}
                              </div>

                              {/* Role */}
                              <div>
                                 <label className="block text-xs font-medium text-gray-300 mb-1">Role</label>
                                 <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full p-2.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                 >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                 </select>
                              </div>

                              {/* Buttons */}
                              <div className="flex justify-end space-x-3 pt-3">
                                 <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-1.5 text-sm bg-gray-700 text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition"
                                 >
                                    Cancel
                                 </button>
                                 <button
                                    type="submit"
                                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition"
                                 >
                                    {editId ? "Update" : "Create"}
                                 </button>
                              </div>
                           </form>
                           
                        </div>
                     </div>
                  </div>
               )}

            </div>
         </div>
      </div>
   );
}

export default AdminDashboard;