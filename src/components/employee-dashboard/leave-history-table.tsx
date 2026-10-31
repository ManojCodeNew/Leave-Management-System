import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Filter, FileText, RotateCw, Search, Loader2 } from 'lucide-react';
import { LeaveApplication, LeaveStatus } from '../../types/leave.types';
import StatusBadge from '../ui/status-badge';
import AppSelect from '../ui/inputs/app-select';
import AppInput from '../ui/inputs/app-input';
import EmptyState from '../ui/empty-state';
import { formatDate, formatDateTime } from '../../utils/date.utils';
import { formatDuration } from '../../utils/format.utils';
import { LEAVE_STATUS_OPTIONS } from '../../config/data';
import { useInfiniteScroll } from '../../hooks/use-infinite-scroll';

export interface LeaveHistoryTableProps {
  leaves: LeaveApplication[];
  selectedStatus?: LeaveStatus | 'ALL';
  onStatusChange?: (status: LeaveStatus | 'ALL') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  totalPages?: number;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  leaves,
  selectedStatus = 'ALL',
  onStatusChange,
  searchTerm = '',
  onSearchChange,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  totalCount = leaves.length,
  totalPages = 1,
}) => {
  const [filter, setFilter] = useState<LeaveStatus | 'ALL'>(selectedStatus);
  const [search, setSearch] = useState(searchTerm);

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: onLoadMore || (() => {}),
  });

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value as LeaveStatus | 'ALL';
      setFilter(val);
      if (onStatusChange) {
        onStatusChange(val);
      }
    },
    [onStatusChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearch(val);
      if (onSearchChange) {
        onSearchChange(val);
      }
    },
    [onSearchChange]
  );

  // If client-side search is needed as fallback (e.g. on dashboard where full list was passed)
  const displayedLeaves = useMemo(() => {
    if (onLoadMore) {
      // In paginated mode, backend handles filtering
      return leaves;
    }
    const q = search.toLowerCase().trim();
    return leaves.filter((l) => {
      const statusMatch =
        filter === 'ALL' || l.status.toUpperCase() === filter.toUpperCase();
      if (!statusMatch) return false;
      if (!q) return true;
      return (
        l.reason?.toLowerCase().includes(q) ||
        formatDate(l.startDate).toLowerCase().includes(q)
      );
    });
  }, [leaves, filter, search, onLoadMore]);

  return (
    <div className="space-y-4 text-left">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Leave Applications History</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track all submitted, approved, and rejected leave requests with infinite scroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading}
              title="Refresh latest leave history"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 transition-colors disabled:opacity-50 shrink-0"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-indigo-600 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}

          {/* Search Input (Debounced) */}
          <div className="w-full sm:w-60">
            <AppInput
              placeholder="Search reason or dates..."
              value={search}
              onChange={handleSearchChange}
              icon={<Search className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <AppSelect
              options={LEAVE_STATUS_OPTIONS}
              value={filter}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Counter Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{displayedLeaves.length}</strong> of{' '}
          <strong className="text-slate-800">{totalCount}</strong> applications
        </span>
        {totalPages > 1 && (
          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            Page 1 to {Math.ceil(displayedLeaves.length / 10) || 1} of {totalPages}
          </span>
        )}
      </div>

      {/* Table view */}
      {displayedLeaves.length === 0 ? (
        <EmptyState
          title="No Leave Records Found"
          description={
            filter === 'ALL'
              ? 'You have not submitted any leave applications yet.'
              : `No leave applications found matching your criteria.`
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Leave Dates</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Submitted On</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Review / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">
                            {formatDate(leave.startDate)}
                          </span>
                          <span className="text-slate-400 mx-1.5 font-light">to</span>
                          <span className="font-semibold text-slate-800">
                            {formatDate(leave.endDate)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {formatDuration(leave.duration)}
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(leave.appliedAt || leave.createdAt)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-500">
                      {leave.reviewedBy ? (
                        <div>
                          <span className="font-medium text-slate-700">
                            By {typeof leave.reviewedBy === 'object' ? leave.reviewedBy.name : 'Admin'}
                          </span>
                          {leave.adminComment && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate" title={leave.adminComment}>
                              &quot;{leave.adminComment}&quot;
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending Admin Review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Infinite Scroll Sentinel & Loader */}
          <div ref={loadMoreRef} className="py-4 px-6 border-t border-slate-100 text-center">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more leave history on scroll...</span>
              </div>
            ) : hasNextPage ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400">Scroll down to fetch more records</span>
                {onLoadMore && (
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline ml-2"
                  >
                    (or click to load more)
                  </button>
                )}
              </div>
            ) : displayedLeaves.length > 0 ? (
              <p className="text-xs text-slate-400 font-medium">
                ✓ All {totalCount} records loaded
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHistoryTable;
