import React, { useState, useMemo } from 'react';
import Navbar from '../components/ui/navbar';
import AdminLeavesTable from '../components/admin-dashboard/admin-leaves-table';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useInfiniteAdminLeaves } from '../hooks/use-admin';
import { useDebounce } from '../hooks/use-debounce';
import { LeaveStatus } from '../types/leave.types';

export const AdminLeavesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 400ms search debouncing to optimize backend queries
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteAdminLeaves(statusFilter, debouncedSearchTerm, 10);

  const leaves = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );

  const totalCount = data?.pages[0]?.meta?.totalCount ?? leaves.length;
  const totalPages = data?.pages[0]?.meta?.totalPages ?? 1;

  if (isLoading && leaves.length === 0) {
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
        <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, approve, and reject organization-wide employee leave requests with infinite scroll.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Total: {totalCount} Requests
            </span>
          </div>
        </div>

        <AdminLeavesTable
          leaves={leaves}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </main>
    </div>
  );
};

export default AdminLeavesPage;

