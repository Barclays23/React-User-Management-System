import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/authSlice";
import apiCalls from "../../utils/api";
import { toast } from "react-toastify";
import { FiEdit, FiCamera, FiUser } from "react-icons/fi";
import RippleSpinner from "../../components/LoadingSpinners/RippleSpinner";



function Profile() {
   const { user, accessToken } = useSelector((state) => state.auth);

   const [name, setName] = useState(user?.name || "");
   const [email, setEmail] = useState(user?.email || "");
   const [mobile, setMobile] = useState(user?.mobile || "");
   const [profileImage, setProfileImage] = useState(null);
   
   // Error states
   const [nameError, setNameError] = useState('');
   const [emailError, setEmailError] = useState('');
   const [mobileError, setMobileError] = useState('');
   const [imageError, setImageError] = useState('');
   
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [newPasswordError, setNewPasswordError] = useState('');
   const [currentPasswordError, setCurrentPasswordError] = useState('');
   
   
   const [showEditProfile, setShowEditProfile] = useState(false);
   const [showChangePassword, setShowChangePassword] = useState(false);
   const [previewImage, setPreviewImage] = useState(null);
   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch();

   useEffect(() => {
      const fetchProfile = async () => {
         if (!accessToken) return;

         try {
            setLoading(true);
            const data = await apiCalls.getProfile();
            dispatch(updateUser(data));
            setName(data.name);  // why set this ??  user is fetched by useSelector
            setEmail(data.email);  // why set this ??  user is fetched by useSelector
            setMobile(data.mobile);

         } catch (err) {
            const errorMessage =
               err.response?.data?.message ||
               "Unable to load your profile at the moment. Please try again later";
            toast.error(errorMessage);
         } finally {
            setTimeout(() => {
               setLoading(false);
            }, 500);
         }
      };
      fetchProfile();
   }, [accessToken, dispatch]);



   const validateForm = () => {
      let isValid = true;

      const trimmedName = (name || '').trim();
      const trimmedEmail = (email || '').trim();
      const trimmedMobile = (mobile || '').trim();

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
      }  else if (imageError) {
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

      return isValid;
   };



   const handleProfileUpdate = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("mobile", mobile);

      if (profileImage) {
         formData.append("profileImage", profileImage);
      }

      try {
         const data = await apiCalls.updateProfile(formData);
         toast.success("Profile updated successfully");
         dispatch(updateUser(data));
         setShowEditProfile(false);
         setPreviewImage(null);

      } catch (err) {
         const errorMessage =
         err.response?.data?.message ||
         "Something went wrong. Please try again later.";
         toast.error(errorMessage);
         
      } finally {
         setTimeout(() => setLoading(false), 300);
      }
   };


   const handleCancel = () => {
      setShowEditProfile(false);
      setPreviewImage(null);
      setProfileImage(null);
      setName(user?.name || "");
      setEmail(user?.email || "");
      setMobile(user?.mobile || "");
   };



   const validateResetPassword = () => {
      let isValid = true;

      const trimmedCurrent = currentPassword.trim();
      const trimmedNew = newPassword.trim();

      // Password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,20}$/;

      if (!trimmedCurrent) {
         setCurrentPasswordError('Please enter your current password.');
         isValid = false;
      } else {
         setCurrentPasswordError('');
      }

      if (!trimmedNew) {
         setNewPasswordError('Password cannot be blank or contain only spaces.');
         isValid = false;
      } else if (!passwordRegex.test(trimmedNew)) {
         setNewPasswordError('Password must be 8–20 characters long and include uppercase, lowercase, number, and special character.');
         isValid = false;
      } else {
         setNewPasswordError('');
      }

      return isValid;
   };


   const handlePasswordUpdate = async (e) => {
      e.preventDefault();

      if (!validateResetPassword()) return;
      
      try {
         setLoading(true);
         const data = await apiCalls.updatePassword({
            currentPassword,
            newPassword,
         });

         toast.success(data.message || "Password updated successfully");
         setCurrentPassword("");
         setNewPassword("");
         setShowChangePassword(false);

      } catch (err) {
         const errorMessage =
         err.response?.data?.message ||
         "Something went wrong. Please try again later.";
         toast.error(errorMessage);

      } finally {
         setLoading(false);
      }
   };



   if (loading) {
      return <RippleSpinner/>
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 sm:p-6 md:p-10">
         <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-900 rounded-xl shadow-lg shadow-blue-800 p-6 sm:p-8 md:p-10 text-gray-100 relative">
            {/* Edit Button */}
            <button
               onClick={() => {
               setShowEditProfile(!showEditProfile);
               setShowChangePassword(false);
               }}
               className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
               title="Edit Profile"
            >
               <FiEdit className="w-6 h-6" />
            </button>

            {/* Profile Header */}
            <div className="text-center">
               <div className="relative inline-block">
               {previewImage || user?.profilePic ? (
                  <img
                     src={
                     previewImage
                        ? previewImage
                        : user?.profilePic ||
                           `/uploads/profile-pics/${user.profilePic}`
                     }
                     alt="Profile"
                     className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-blue-300"
                  />
               ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-blue-300 flex items-center justify-center bg-gray-800">
                     <FiUser className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
               )}

               {showEditProfile && (
                  <>
                     <button
                        onClick={() =>
                           document.getElementById("profileImageInput").click()
                        }
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                        title="Change Profile Image"
                        >
                        <FiCamera className="w-4 h-4" />
                     </button>
                     <input
                        id="profileImageInput"
                        type="file"
                        onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                           if (file.size > 5 * 1024 * 1024) { // 5MB
                              setImageError('Image size must be less than 5MB.');
                              setProfileImage(null);
                              setPreviewImage(null);
                           } else {
                              setProfileImage(file);
                              setPreviewImage(URL.createObjectURL(file));
                              setImageError('');
                           }
                        }
                        }}
                        className="hidden"
                     />
                  </>
               )}
               </div>
               {imageError && (<p className="text-xs text-red-500 mt-2 text-center">{imageError}</p>)}

               <h2 className="text-xl sm:text-2xl font-bold text-white mt-4">
               {user?.name}
               </h2>
               <p className="text-gray-400 text-sm sm:text-base">{user?.email}</p>
               <p className="text-gray-400 text-sm sm:text-base">
               {user?.mobile}
               </p>
            </div>

            {/* Edit Profile */}
            {showEditProfile && (
               <div className="mt-6 border-t border-gray-700 pt-6">
               <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
               <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                     <label className="block text-sm sm:text-base font-medium">
                     Name
                     </label>
                     <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                     />
                     {nameError && (
                     <p className="text-sm text-red-400">{nameError}</p>
                     )}
                  </div>

                  <div>
                     <label className="block text-sm sm:text-base font-medium">
                     Email
                     </label>
                     <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                     />
                     {emailError && (
                     <p className="text-sm text-red-400">{emailError}</p>
                     )}
                  </div>

                  <div>
                     <label className="block text-sm sm:text-base font-medium">
                     Mobile
                     </label>
                     <input
                     type="text"
                     value={mobile}
                     onChange={(e) => setMobile(e.target.value)}
                     className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                     />
                     {mobileError && (
                     <p className="text-sm text-red-400">{mobileError}</p>
                     )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                     <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 cursor-pointer"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 cursor-pointer"
                     >
                        Save Changes
                     </button>
                  </div>
               </form>
               </div>
            )}

            {/* Change Password */}
            {!showChangePassword ? (
               <div className="mt-6 text-center border-t border-gray-700 pt-6">
               <button
                  onClick={() => {
                     setShowChangePassword(true);
                     setShowEditProfile(false);
                  }}
                  className="text-blue-400 hover:text-blue-500 font-medium text-sm sm:text-base cursor-pointer"
               >
                  Change Password
               </button>
               </div>
            ) : (
               <form
               onSubmit={handlePasswordUpdate}
               className="mt-6 border-t border-gray-700 pt-6"
               >
               <h3 className="text-lg font-semibold mb-4">Change Password</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium">
                     Current Password
                     </label>
                     <input
                     type="password"
                     value={currentPassword}
                     onChange={(e) => setCurrentPassword(e.target.value)}
                     className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                     />
                     {currentPasswordError && (
                     <p className="text-sm text-red-400">
                        {currentPasswordError}
                     </p>
                     )}
                  </div>

                  <div>
                     <label className="block text-sm font-medium">
                     New Password
                     </label>
                     <input
                     type="password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                     />
                     {newPasswordError && (
                     <p className="text-sm text-red-400">{newPasswordError}</p>
                     )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                     <button
                     type="button"
                     onClick={() => setShowChangePassword(false)}
                     className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 cursor-pointer"
                     >
                     Cancel
                     </button>
                     <button
                     type="submit"
                     className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 cursor-pointer"
                     >
                     Save Password
                     </button>
                  </div>
               </div>
               </form>
            )}
         </div>
      </div>
   );

}

export default Profile;
