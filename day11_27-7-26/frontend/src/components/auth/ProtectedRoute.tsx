import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, removeToken } from '../../utils/auth';
import { authService } from '../../services/authService';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        await authService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        removeToken();
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-700"></div>
          <div className="h-4 w-32 rounded bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
