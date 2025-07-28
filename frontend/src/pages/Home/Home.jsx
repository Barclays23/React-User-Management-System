import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiUserCheck, FiSettings, FiUploadCloud } from 'react-icons/fi';

const Home = () => {
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex items-center justify-center px-2">
      <div className="w-full max-w-3xl bg-gray-800 shadow-lg shadow-blue-800 p-6 sm:p-10 rounded-2xl text-white">
        {/* Header */}
        <p className="text-lg text-green-400 font-medium mb-4">
          Welcome back, <span className="font-semibold">{user?.name || 'User'}</span>!
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
          Welcome to <span className="text-blue-400">User Management System</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base text-center mb-8">
          A powerful, secure and responsive platform to manage your users, profiles, and admin tasks effortlessly.
        </p>

        {/* Feature Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm sm:text-base mb-8">
          <div className="bg-gray-700 rounded-xl p-4 flex flex-col items-center">
            <FiUserCheck size={24} className="text-blue-400 mb-2" />
            <p className="text-white text-center">Authenticate & Manage Profiles</p>
          </div>
          <div className="bg-gray-700 rounded-xl p-4 flex flex-col items-center">
            <FiUploadCloud size={24} className="text-green-400 mb-2" />
            <p className="text-white text-center">Upload & Manage Images</p>
          </div>
          <div className="bg-gray-700 rounded-xl p-4 flex flex-col items-center">
            <FiSettings size={24} className="text-yellow-400 mb-2" />
            <p className="text-white text-center">Admin Dashboard Features</p>
          </div>
        </div>

        {/* Auth Section */}
        {isAuthenticated ? (
          <div className="text-center">
            <Link
              to="/profile"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-200 shadow-md text-sm sm:text-base"
            >
              Go to Profile
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-center">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-200 shadow-md text-sm sm:text-base"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-full transition duration-200 shadow-md text-sm sm:text-base"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
