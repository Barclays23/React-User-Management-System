import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../../redux/slices/authSlice';
import apiCalls from '../../utils/api';
import { toast } from 'react-toastify';
import RippleSpinner from '../../components/LoadingSpinners/RippleSpinner';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, user, accessToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  const validateForm = () => {
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      setPasswordError('Password cannot be blank or contain only spaces.');
      isValid = false;
    } else if (trimmedPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else if (trimmedPassword.length > 20) {
      setPasswordError('Password is too long. Maximum 20 character allowed');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await apiCalls.signIn({ email, password });
      // console.log('signIn API response :', res);
      
      // Debug: Check if res structure is correct
      if (!res.userData || !res.accessToken) {
        console.error('Invalid API response structure:', res);
        toast.error('Invalid response from server');
        return;
      }

      // console.log('Redux state - Before dispatch :', { isAuthenticated, user, accessToken });
      
      // Dispatch the action to store the res in redux state.
      dispatch(setCredentials({ 
        user: res.userData, 
        accessToken: res.accessToken,
      }));
      
      toast.success('Login successful!');
      navigate('/profile');

    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again later.';
      toast.error(errorMessage);

    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return <RippleSpinner/>
  }


  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl text-center font-bold text-white mb-4">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-1.5 bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {emailError && <p className="text-sm text-red-400 mt-1">{emailError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-1.5 bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {passwordError && <p className="text-sm text-red-400 mt-1">{passwordError}</p>}
        </div>

        <button 
          type="submit" 
          className="w-full font-semibold mt-7 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 cursor-pointer"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-sm text-left mt-4 text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;