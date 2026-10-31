import React, { useState, useMemo, useCallback } from 'react';
import Navbar from '../components/ui/navbar';
import LeaveBalanceCard from '../components/employee-dashboard/leave-balance-card';
import RecentLeaveRequests from '../components/employee-dashboard/recent-leave-requests';
import LeaveHistoryTable from '../components/employee-dashboard/leave-history-table';
import AppDrawer from '../components/ui/modals/app-drawer';
import LeaveRequestForm from '../components/employee-dashboard/leave-request-form';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useLeaveBalance, useMyLeaves } from '../hooks/use-leave';
import { useAuth } from '../hooks/use-auth';

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isApplyDrawerOpen, setIsApplyDrawerOpen] = useState(false);
  const [isSyncRefreshing, setIsSyncRefreshing] = useState(false);

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useLeaveBalance();

  const {
    data: leaves = [],
    isLoading: isLeavesLoading,
    isRefetching: isLeavesRefetching,
    refetch: refetchLeaves,
  } = useMyLeaves();

  // Synchronize entire dashboard when Leave History refresh is clicked (Requirement 9)
  const handleSynchronizedRefresh = useCallback(async () => {
    setIsSyncRefreshing(true);
    try {
      await Promise.all([refetchLeaves(), refetchBalance()]);
    } finally {
      setIsSyncRefreshing(false);
    }
  }, [refetchLeaves, refetchBalance]);

  const handleOpenDrawer = useCallback(() => {
    setIsApplyDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsApplyDrawerOpen(false);
  }, []);

  const balance = useMemo(() => {
    return (
      balanceData?.balance || {
        leaveAllocation: user?.leaveAllocation || 20,
        usedLeave: user?.usedLeave || 0,
        availableLeave: user?.availableLeave || 20,
        pendingDays: 0,
        pendingRequestsCount: 0,
      }
    );
  }, [balanceData?.balance, user?.leaveAllocation, user?.usedLeave, user?.availableLeave]);

  const recentApps = useMemo(() => {
    return balanceData?.recentApplications || leaves.slice(0, 5);
  }, [balanceData?.recentApplications, leaves]);

  const approvedLeaves = useMemo(() => {
    return balanceData?.approvedLeaves || [];
  }, [balanceData?.approvedLeaves]);

  if (isBalanceLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner fullPage label="Loading employee dashboard..." />
      </div>
    );
  }

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
          onOpenApplyModal={handleOpenDrawer}
        />

        {/* History Table with Synchronized Refresh Option */}
        <LeaveHistoryTable
          leaves={leaves}
          isLoading={isLeavesLoading}
          onRefresh={handleSynchronizedRefresh}
          isRefreshing={isLeavesRefetching || isSyncRefreshing}
        />
      </main>

      {/* Apply Leave Slide-over Drawer (Requirement 10) */}
      <AppDrawer
        isOpen={isApplyDrawerOpen}
        onClose={handleCloseDrawer}
        title="Apply for Leave"
        description="Select your requested dates. End date is optional for a 1-day leave."
        maxWidth="2xl"
      >
        <LeaveRequestForm
          availableBalance={balance.availableLeave}
          approvedLeaves={approvedLeaves}
          onSuccess={handleCloseDrawer}
        />
      </AppDrawer>
    </div>
  );
};

export default EmployeeDashboardPage;
