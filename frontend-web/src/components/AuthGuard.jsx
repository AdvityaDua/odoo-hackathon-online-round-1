import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/auth';

const AuthGuard = ({ children }) => {
  if (!authService.getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;

