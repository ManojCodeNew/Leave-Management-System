import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import AppButton from '../components/ui/buttons/app-button';
import { useAuth } from '../hooks/use-auth';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const handleReturn = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The page you requested could not be found or you may not have authorization to view it.
        </p>
        <div className="pt-2">
          <AppButton
            variant="primary"
            icon={<Home className="w-4 h-4" />}
            onClick={handleReturn}
          >
            Return to Dashboard
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

