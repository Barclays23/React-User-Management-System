import { createSlice } from '@reduxjs/toolkit';


// Initial state for auth
const initialState = {
  user: null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken') || null,
};



// Create auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      // console.log('Before setCredentials:', { currentState: state, payload: action.payload });

      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
      state.accessToken = action.payload.accessToken || state.accessToken; // Keep existing accessToken if not provided
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));  // Persist user

      // console.log('After setCredentials:', { newState: state });
    },

    // Update only the access token (for refresh)
    updateAccessToken: (state, action) => {
      console.log('payload in updateAccessToken :', action.payload.newAccessToken);
      state.accessToken  = action.payload.newAccessToken;
      localStorage.setItem('accessToken', action.payload.newAccessToken);
      console.log('refreshed token updated in redux state');
    },

    
    // Update user profile
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    
    // Logout user
    removeCredentials: (state) => {
      // console.log('removeCredentials called in redux.');
      
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');

      // console.log('State removed from redux & localStorage.');
    },
  },
});

export const { setCredentials, updateAccessToken, updateUser, removeCredentials } = authSlice.actions;
export default authSlice.reducer;