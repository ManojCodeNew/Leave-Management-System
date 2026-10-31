import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Navbar from '../components/ui/navbar';
import LeaveHistoryTable from '../components/employee-dashboard/leave-history-table';
import AppButton from '../components/ui/buttons/app-button';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useMyLeaves } from '../hooks/use-leave';

export const LeaveHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: leaves = [],
    isLoading,
    isRefetching,
    refetch,
  } = useMyLeaves();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner fullPage label="Loading leave history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <button
              onClick={() => navigate('/employee/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">My Leave History</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive log of all your submitted leave applications.
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <AppButton
              variant="primary"
              size="small"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/employee/apply')}
            >
              Apply New Leave
            </AppButton>
          </div>
        </div>

        {/* Full Table with Refresh Option */}
        <LeaveHistoryTable
          leaves={leaves}
          isLoading={isLoading}
          onRefresh={refetch}
          isRefreshing={isRefetching}
        />
      </main>
    </div>
  );
};

export default LeaveHistoryPage;
