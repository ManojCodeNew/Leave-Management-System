import { LoginCredentials } from '../types/auth.types';

export interface ValidationErrors {
  [key: string]: string;
}

export const validateLogin = (credentials: LoginCredentials): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!credentials.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!credentials.password) {
    errors.password = 'Password is required.';
  } else if (credentials.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return errors;
};

