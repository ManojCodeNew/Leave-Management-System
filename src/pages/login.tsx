import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { validateLogin } from '../validation/auth.validation';
import AppButton from '../components/ui/buttons/app-button';
import AppInput from '../components/ui/inputs/app-input';
import { IMAGES } from '../config/images';
import { APP_NAME, APP_DESCRIPTION } from '../config/data';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, isLoading, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLogin({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    try {
      await login({ email, password });
    } catch {
      // Auth error is captured in Redux
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-left relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" />

        {/* Header Logo & Brand */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/50 rounded-3xl p-3.5 border border-indigo-100 shadow-xs mx-auto">
            <img
              src={IMAGES.IMG_APP_ICON}
              alt="LeaveMate Icon"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {APP_NAME}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {APP_DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Error notification */}
        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AppInput
            label="Email Address"
            type="email"
            placeholder="name@exelon.com"
            required
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            icon={<Mail className="w-4 h-4" />}
            autoComplete="email"
          />

          <AppInput
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
          />

          <div className="pt-2">
            <AppButton
              type="submit"
              variant="primary"
              fullWidth
              size="medium"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In to Account'}
            </AppButton>
          </div>
        </form>

        {/* Quick Fill Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickFill('employee@exelon.com', 'employee123')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Employee Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@exelon.com', 'admin123')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

