import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setCredentials, logoutAction, setAuthError } from '../redux/slices/auth.slice';
import { authService } from '../services/auth.service';
import { queryClient } from '../config/query-client';
import { LoginCredentials } from '../types/auth.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setIsSubmitting(true);
    dispatch(setAuthError(null));

    try {
      // Clear any cached query data from a previously active user session
      queryClient.clear();

      const data = await authService.login(credentials);
      dispatch(setCredentials({ user: data.user, token: data.token }));

      // Redirect according to user role
      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
      return data;
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      dispatch(setAuthError(msg));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      // Clear TanStack Query server cache immediately
      queryClient.clear();
      await authService.logout();
    } catch (e) {
      console.warn('Logout error ignored:', e);
    } finally {
      dispatch(logoutAction());
      navigate('/login', { replace: true });
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    isEmployee: user?.role === 'EMPLOYEE',
    isLoading: isLoading || isSubmitting,
    error,
    login,
    logout,
  };
};

export default useAuth;
