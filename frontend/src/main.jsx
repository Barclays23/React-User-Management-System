import React from 'react';
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import './index.css';



// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

// Render the app with Redux Provider
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);