import React, { useState } from 'react';
import Navbar from '../components/ui/navbar';
import AdminLeavesTable from '../components/admin-dashboard/admin-leaves-table';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useAdminLeaves } from '../hooks/use-admin';
import { LeaveStatus } from '../types/leave.types';

export const AdminLeavesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: leaves = [], isLoading } = useAdminLeaves(statusFilter, searchTerm);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner fullPage label="Loading organization leave records..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, approve, and reject all organization-wide employee leave requests.
          </p>
        </div>

        <AdminLeavesTable
          leaves={leaves}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </main>
    </div>
  );
};

export default AdminLeavesPage;

