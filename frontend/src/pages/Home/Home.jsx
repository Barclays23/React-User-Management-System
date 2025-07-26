import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth);
  console.log('user in Home page:', user, isAuthenticated, accessToken);
  

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome to User Management App</h1>
      <p className="text-gray-600 mb-6">
        Manage your profile, upload images, and explore admin features. Join us today!
      </p>

      {isAuthenticated ? (
        <div>
          <p className="text-lg text-green-600 font-semibold mb-4">
            Hello, {user?.name || 'User'}! You're logged in.
          </p>
          <Link
            to="/profile"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Go to Profile
          </Link>
        </div>
      ) : (
        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
