// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import countReducer from './slices/countSlice';

// Create Redux store with auth slice
const store = configureStore({
  reducer: {
    auth: authReducer,
    counter: countReducer,
  },
});

export default store;