import React from 'react';
import Navbar from '../components/ui/navbar';
import EmployeeStatistics from '../components/admin-dashboard/employee-statistics';
import LeaveStatistics from '../components/admin-dashboard/leave-statistics';
import PendingRequests from '../components/admin-dashboard/pending-requests';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useAdminDashboard, useAdminLeaves } from '../hooks/use-admin';

export const AdminDashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } = useAdminDashboard();
  const { data: leaves = [], isLoading: isLeavesLoading } = useAdminLeaves();

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner fullPage label="Loading admin dashboard..." />
      </div>
    );
  }

  const overview = dashboardData?.overview || {
    totalEmployees: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalApprovedDays: 0,
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Organization Workforce Banner */}
        <EmployeeStatistics totalEmployees={overview.totalEmployees} />

        {/* Leave Metrics Grid */}
        <LeaveStatistics stats={overview} />

        {/* Pending Requests Section */}
        <PendingRequests pendingLeaves={pendingLeaves} />
      </main>
    </div>
  );
};

export default AdminDashboardPage;

