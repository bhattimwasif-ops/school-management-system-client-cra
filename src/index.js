import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure this line
import { RouterProvider } from 'react-router-dom';
import { router } from './components/Layout';

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>,
  document.getElementById('root')
);