import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import Navbar from '../components/ui/navbar';
import LeaveRequestForm from '../components/employee-dashboard/leave-request-form';
import AppButton from '../components/ui/buttons/app-button';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useLeaveBalance } from '../hooks/use-leave';

export const ApplyLeavePage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useLeaveBalance();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner fullPage label="Preparing leave application form..." />
      </div>
    );
  }

  const availableBalance = data?.balance?.availableLeave ?? 20;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => navigate('/employee/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 text-left">Apply for Leave</h1>
          <p className="text-xs text-slate-500 text-left mt-0.5">
            Submit your leave application for admin approval.
          </p>
        </div>

        {/* Current Available Balance Callout */}
        <div className="bg-indigo-900 text-white p-5 rounded-2xl flex items-center justify-between text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl text-indigo-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-indigo-200 font-medium">Your Available Balance</p>
              <p className="text-xl font-bold">{availableBalance} Days Remaining</p>
            </div>
          </div>
          <span className="text-xs text-indigo-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Official Balance
          </span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <LeaveRequestForm
            availableBalance={availableBalance}
            onSuccess={() => navigate('/employee/history')}
          />
        </div>

        {/* Policy Notice */}
        <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 text-left text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Company Leave Guidelines:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Submitted leaves are placed under PENDING status until reviewed.</li>
            <li>Approved leave days will automatically be deducted from your leave balance.</li>
            <li>Rejected leaves will not affect your available leave balance.</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ApplyLeavePage;

