import React, { useState } from 'react';
import Navbar from '../components/ui/navbar';
import LeaveBalanceCard from '../components/employee-dashboard/leave-balance-card';
import RecentLeaveRequests from '../components/employee-dashboard/recent-leave-requests';
import LeaveHistoryTable from '../components/employee-dashboard/leave-history-table';
import AppModal from '../components/ui/modals/app-modal';
import LeaveRequestForm from '../components/employee-dashboard/leave-request-form';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useLeaveBalance, useMyLeaves } from '../hooks/use-leave';
import { useAuth } from '../hooks/use-auth';

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: balanceData, isLoading: isBalanceLoading } = useLeaveBalance();
  const {
    data: leaves = [],
    isLoading: isLeavesLoading,
    isRefetching: isLeavesRefetching,
    refetch: refetchLeaves,
  } = useMyLeaves();

  if (isBalanceLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner fullPage label="Loading employee dashboard..." />
      </div>
    );
  }

  const balance = balanceData?.balance || {
    leaveAllocation: user?.leaveAllocation || 20,
    usedLeave: user?.usedLeave || 0,
    availableLeave: user?.availableLeave || 20,
    pendingDays: 0,
    pendingRequestsCount: 0,
  };

  const recentApps = balanceData?.recentApplications || leaves.slice(0, 5);
  const approvedLeaves = balanceData?.approvedLeaves || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Leave Balance Overview Banner */}
        <LeaveBalanceCard
          balance={balance}
          employeeName={user?.name}
          department={user?.department}
        />

        {/* Recent Applications Section */}
        <RecentLeaveRequests
          applications={recentApps}
          onOpenApplyModal={() => setIsApplyModalOpen(true)}
        />

        {/* History Table with Refresh Option */}
        <LeaveHistoryTable
          leaves={leaves}
          isLoading={isLeavesLoading}
          onRefresh={refetchLeaves}
          isRefreshing={isLeavesRefetching}
        />
      </main>

      {/* Quick Apply Leave Modal */}
      <AppModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        description="Select your requested dates and submit for manager approval."
        maxWidth="lg"
      >
        <LeaveRequestForm
          availableBalance={balance.availableLeave}
          approvedLeaves={approvedLeaves}
          onSuccess={() => setIsApplyModalOpen(false)}
        />
      </AppModal>
    </div>
  );
};

export default EmployeeDashboardPage;
