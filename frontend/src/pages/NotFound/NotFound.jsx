import { Link } from 'react-router-dom';

// 404 Page Not Found component
function NotFound() {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;