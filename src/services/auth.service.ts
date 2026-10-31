import api from './api/axios-instance';
import { ENDPOINTS } from '../config/endpoints';
import { LoginCredentials, AuthResponse, User } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse['data']> => {
    const response = await api.post(ENDPOINTS.auth.login, credentials);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get(ENDPOINTS.auth.me);
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(ENDPOINTS.auth.logout);
    } finally {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
    }
  },
};

