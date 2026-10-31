import React, { useState, useMemo } from 'react';
import { Users, Search, ShieldCheck, Mail, Calendar, Loader2 } from 'lucide-react';
import Navbar from '../components/ui/navbar';
import AppInput from '../components/ui/inputs/app-input';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useInfiniteAdminEmployees } from '../hooks/use-admin';
import { useDebounce } from '../hooks/use-debounce';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';

export const AdminEmployeesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 400ms search debouncing for optimal backend query performance
  const debouncedSearch = useDebounce(searchTerm, 400);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteAdminEmployees(debouncedSearch, 10);

  const employees = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );

  const totalCount = data?.pages[0]?.meta?.totalCount ?? employees.length;
  const totalPages = data?.pages[0]?.meta?.totalPages ?? 1;

  // Infinite scroll trigger
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  if (isLoading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner fullPage label="Loading organization employees..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Organization Employees</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Overview of all registered staff members, departments, and leave balance allocations with infinite scroll.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <AppInput
              placeholder="Search by name, email, department (debounced)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Counter Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{employees.length}</strong> of{' '}
            <strong className="text-slate-800">{totalCount}</strong> employees
          </span>
          {totalPages > 1 && (
            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              Page 1 to {Math.ceil(employees.length / 10) || 1} of {totalPages}
            </span>
          )}
        </div>

        {employees.length === 0 ? (
          <EmptyState
            title="No Employees Found"
            description="No employee records match your search criteria."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Employee ID</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4 text-center">Allocated</th>
                    <th className="py-3.5 px-4 text-center">Used</th>
                    <th className="py-3.5 px-4 text-center">Available</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Request Stats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-mono text-xs font-bold text-slate-600">
                        {emp.employeeId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{emp.name}</p>
                            <p className="text-xs text-slate-500 leading-tight">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-600">
                        {emp.department}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-700">
                        {emp.leaveAllocation} Days
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-rose-600">
                        {emp.usedLeave} Days
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-emerald-600">
                        {emp.availableLeave} Days
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium"
                            title="Pending Requests"
                          >
                            {emp.stats.pendingCount} Pending
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium"
                            title="Approved Requests"
                          >
                            {emp.stats.approvedCount} Approved
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium"
                            title="Rejected Requests"
                          >
                            {emp.stats.rejectedCount} Rejected
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Infinite Scroll Trigger on Scroll */}
            <div ref={loadMoreRef} className="py-4 px-6 border-t border-slate-100 text-center">
              {isFetchingNextPage ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more employees on scroll...</span>
                </div>
              ) : hasNextPage ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400">Scroll down to fetch next page</span>
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline ml-2"
                  >
                    (or click to load more)
                  </button>
                </div>
              ) : employees.length > 0 ? (
                <p className="text-xs text-slate-400 font-medium">
                  ✓ All {totalCount} employees loaded
                </p>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminEmployeesPage;

