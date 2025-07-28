import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../../redux/slices/authSlice';
import apiCalls from '../../utils/api';
import { toast } from 'react-toastify';



function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [showPasswordValidations, setShowPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Immediately validate
    setShowPasswordValidations({
      length: newPassword.length >= 8 && newPassword.length <= 20,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      specialChar: /[@#$%^&*!]/.test(newPassword),
    });
  };


  const getStrengthColor = (validCount) => {
    switch(validCount) {
      case 0: return '#f97316';     // orange-500 (weak)
      case 1: return '#fb2c36';     // red-500 (very weak)
      case 2: return '#f59e0b';     // amber-500 (getting better)
      case 3: return '#fde047';     // yellow-300 (medium)
      case 4: return '#84cc16';     // lime-500 (strong)
      case 5: return '#16a34a';     // green-600 (very strong)
      default: return '#ef4444';    // fallback
    }
  };


  const validateForm = () => {
    let isValid = true;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Name validation
    const nameRegex = /^[a-zA-Z][a-zA-Z .'-]{1,49}$/;
    if (!trimmedName) {
      setNameError('Name is required.');
      isValid = false;
    } else if (!nameRegex.test(trimmedName)) {
      setNameError('Name should contain only letters and can include spaces, dots, hyphens.');
      isValid = false;
    } else if (trimmedName.length < 5) {
      setNameError('Name must be at least 5 characters long.');
      isValid = false;
    } else {
      setNameError('');
    }


    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }


    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile.trim()) {
      setMobileError('Mobile number is required.');
      isValid = false;
    } else if (!mobileRegex.test(mobile.trim())) {
      setMobileError('Please enter a valid 10-digit Indian mobile number.');
      isValid = false;
    } else {
      setMobileError('');
    }


    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,20}$/;

    if (!trimmedPassword) {
      setPasswordError('Password cannot be blank or contain only spaces.');
      isValid = false;
    } else if (!passwordRegex.test(trimmedPassword)) {
      setPasswordError('Password must be 8–20 characters long and include uppercase, lowercase, number, and special character.');
      isValid = false;
    } else {
      setPasswordError('');
    }


    // Confirm password validation
    if (!trimmedConfirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (trimmedPassword !== trimmedConfirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await apiCalls.signUp({ name, email, password, mobile });
      // console.log('res after signUp:', res);
      const {userData, accessToken} = res;

      dispatch(setCredentials({ 
        user: userData, 
        accessToken: accessToken 
      }));  // setting the JWT token and user state
      
      toast.success(`Welcome ${userData.name}, Registration completed successfully!`);
      navigate('/profile');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again later.';
      toast.error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-2 sm:p-2">
      <div className="w-full max-w-md sm:max-w-lg bg-gray-900 p-4 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl text-center font-bold text-white mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 text-sm sm:text-base bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full Name"
            />
            {nameError && <p className="text-sm text-red-400 mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-sm sm:text-base bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email Address"
            />
            {emailError && <p className="text-sm text-red-400 mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-2 text-sm sm:text-base bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
              placeholder="10-Digit Mobile Number"
            />
            {mobileError && <p className="text-sm text-red-400 mt-1">{mobileError}</p>}
          </div>
          {isTypingPassword && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {Object.entries({
                  length: "8–20 Characters",
                  uppercase: "Uppercase Letter",
                  lowercase: "Lowercase Letter",
                  number: "Number",
                  specialChar: "Special Character"
                }).map(([key, text]) => (
                  <div key={key} className={`flex items-center ${showPasswordValidations[key] ? 'text-green-400' : 'text-gray-500'}`}>
                    {showPasswordValidations[key] ? (
                      <svg className="w-4 h-4 mr-2 border rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-4 h-4 mr-2 border border-gray-400 rounded-full"></div>
                    )}
                    {text}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.values(showPasswordValidations).filter(Boolean).length / 5) * 100}%`,
                    backgroundColor: getStrengthColor(Object.values(showPasswordValidations).filter(Boolean).length)
                  }}
                ></div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setIsTypingPassword(true)}
              onBlur={() => setIsTypingPassword(false)}
              className="w-full p-2 text-sm sm:text-base bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
            {passwordError && <p className="text-sm text-red-400 mt-1">{passwordError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 text-sm sm:text-base bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-Enter Password"
            />
            {confirmPasswordError && <p className="text-sm text-red-400 mt-1">{confirmPasswordError}</p>}
          </div>
          <button
            type="submit"
            className="w-full font-semibold bg-blue-600 text-white p-2 text-sm sm:text-base rounded hover:bg-blue-700 transition duration-200 cursor-pointer"
          >
            Register
          </button>
          <div className="text-sm text-center sm:text-left mt-4 text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );

}

export default Register;