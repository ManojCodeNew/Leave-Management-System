import React, { useState, useMemo } from 'react';
import { Users, Search, ShieldCheck, Mail, Calendar, Loader2 } from 'lucide-react';
import Navbar from '../components/ui/navbar';
import AppInput from '../components/ui/inputs/app-input';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';
import { useInfiniteAdminEmployees } from '../hooks/use-admin';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';

export const AdminEmployeesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch paginated employees without firing API requests on every search keystroke
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteAdminEmployees('', 15);

  const employees = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );

  // Instant client-side search filtering on the received list
  const filteredEmployees = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q)
    );
  }, [employees, searchTerm]);

  const totalCount = data?.pages[0]?.meta?.totalCount ?? employees.length;

  // Infinite scroll trigger on page scroll
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
              Overview of all registered staff members, departments, and leave balance allocations with instant filtering and scroll loading.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <AppInput
              placeholder="Filter by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Counter Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{filteredEmployees.length}</strong>
            {searchTerm ? ` matching "${searchTerm}"` : ''} of{' '}
            <strong className="text-slate-800">{employees.length}</strong> loaded employees
            {totalCount > employees.length && ` (${totalCount} total in system)`}
          </span>
          {hasNextPage && (
            <span className="text-indigo-600 font-medium">
              Scroll down to auto-load more
            </span>
          )}
        </div>

        {filteredEmployees.length === 0 ? (
          <EmptyState
            title="No Employees Found"
            description={
              searchTerm
                ? `No employees match "${searchTerm}". Try clearing your filter.`
                : 'No employee records found in system.'
            }
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
                  {filteredEmployees.map((emp) => (
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

