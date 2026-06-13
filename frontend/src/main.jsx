import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Initialize Cesium Ion
import { Ion } from 'cesium';
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
