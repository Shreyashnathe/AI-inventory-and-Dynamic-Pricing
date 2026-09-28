import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import SignInPage from './app/auth/sign-in/page';
import SignUpPage from './app/auth/sign-up/page';
import ResetPasswordPage from './app/auth/reset-password/page';

// For now, we'll just render the main App component as before
// But we've structured the files according to Material Kit React pattern
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPasswordPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
