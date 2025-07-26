// API utility for making requests
import axios from 'axios';
import store from '../redux/store';
import { removeCredentials, updateAccessToken } from '../redux/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';



// Helper to decode JWT token (This function is only to see the full details of the token, debugging)
export const decodeToken = (token) => {
  try {
    // console.log('decoding jwtDecode(token)....');

    if (!token || token === 'undefined') {
      console.warn('No valid token provided to jwtDecode decodeToken');
      return null;
    }

    const decoded = jwtDecode(token);
    
    const decodedTokenDetails = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: new Date(decoded.exp * 1000),
      isExpired: decoded.exp * 1000 < Date.now(),
    };

    // console.log('decoded jwtDecode(token) result: ', decodedTokenDetails);
    return decodedTokenDetails;

  } catch (error) {
    console.error('Failed to decode jwtDecode(token) :', error);
    return null;
  }
};


// Instead of calling getAuthToken in every API function, use an Axios instance with default headers:
// apiClient / axiosClient
const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable sending cookies (for refreshToken).
  // headers: {
  //   'Content-Type': 'application/json',
  // },  // no need for default Content-Type — axios will set it per request type

});


// Request interceptor to add auth token
axiosClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error)  // need this here??
);


let hasTokenExpiredToastShown = false;

// Response interceptor for token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      accessToken &&
      originalRequest.url !== '/user/refresh-token'
    ) {
      originalRequest._retry = true;

      try {
        console.log('Attempting to refresh access token');
        
        const response = await apiCalls.refreshAccessToken();  // returns newAccessToken
        console.log('Refresh token response in intercepter :', response);
        const newAccessToken = response.newAccessToken

        if (!newAccessToken) {
          console.log('No new access token in refresh response');
          // throw new Error('No new access token in refresh response');
        }

        store.dispatch(updateAccessToken({newAccessToken}));
        console.log('newAccessToken dispatched to reducer/store');
        
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        // this error comes from the userController.refreshAccessToken (catch block)
        console.error('refreshError in intercepter :', refreshError.response?.data || refreshError.message);
        
        if (!hasTokenExpiredToastShown) {
          const errorMessage = refreshError.response?.data?.message || "Session expired."
          toast.error(errorMessage)
          hasTokenExpiredToastShown = true;
        }
        
        store.dispatch(removeCredentials());
        
        // window.location.href = '/login';
        console.log('redirecting to login page (called from axios intercepter refreshError');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
    // It passes all non-token related errors (e.g., 404, 500, bad requests, validation errors, etc.)
  }
);




// API calls object (NEW)
const apiCalls = {
  getAuthUser: async () => {
    const response = await axiosClient.get('/user/me'); // ✅ token automatically added in headers (in intercepter)
    return response.data;
  },

  refreshAccessToken: async () => {
    const res = await axiosClient.post('/user/refresh-token');
    return res.data; // newAccessToken returning to axiosClient.interceptors.response
  },

  signUp: async (formData) => {
    const response = await axiosClient.post('/user/register', formData);
    return response.data;
  },

  signIn: async (formData) => {
    const response = await axiosClient.post('/user/login', formData);
    return response.data;
  },

  signOut: async () => {
    const response = await axiosClient.post('/user/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosClient.get('/user/profile');
    return response.data;
  },

  updateProfile: async (formData) => {
    const response = await axiosClient.put('/user/profile', formData);
    // for formData, axios automatically set: Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ
    return response.data;
  },

  updatePassword: async (formData) => {
    const response = await axiosClient.put('/user/password', formData);
    return response.data;
  },

  getUsers: async ({ search = '', page = 1, limit = 10 }) => {
    const response = await axiosClient.get(`/admin/users?page=${page}&search=${search}&limit=${limit}`);
    return response.data;
  },

  createUser: async (formData) => {
    const response = await axiosClient.post('/admin/create-user', formData);
    // for formData, axios automatically set: Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ
    return response.data;
  },


  updateUser: async (userId, formData) => {
    const response = await axiosClient.put(`/admin/update-user/${userId}`, formData);
    // for formData, axios automatically set: Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosClient.delete(`/admin/delete-user/${userId}`);
    return response.data;
  },
};


export default apiCalls;