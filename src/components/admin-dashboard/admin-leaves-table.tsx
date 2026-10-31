import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Search, Check, X, Filter } from 'lucide-react';
import { LeaveApplication, LeaveStatus } from '../../types/leave.types';
import StatusBadge from '../ui/status-badge';
import AppButton from '../ui/buttons/app-button';
import AppInput from '../ui/inputs/app-input';
import AppSelect from '../ui/inputs/app-select';
import AppModal from '../ui/modals/app-modal';
import AppTextarea from '../ui/inputs/app-textarea';
import EmptyState from '../ui/empty-state';
import { formatDate, formatDateTime } from '../../utils/date.utils';
import { formatDuration } from '../../utils/format.utils';
import { LEAVE_STATUS_OPTIONS } from '../../config/data';
import { useApproveLeave, useRejectLeave } from '../../hooks/use-admin';

export interface AdminLeavesTableProps {
  leaves: LeaveApplication[];
  selectedStatus?: LeaveStatus | 'ALL';
  onStatusChange?: (status: LeaveStatus | 'ALL') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const AdminLeavesTable: React.FC<AdminLeavesTableProps> = ({
  leaves,
  selectedStatus = 'ALL',
  onStatusChange,
  searchTerm = '',
  onSearchChange,
}) => {
  const [filter, setFilter] = useState<LeaveStatus | 'ALL'>(selectedStatus);
  const [search, setSearch] = useState(searchTerm);

  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value as LeaveStatus | 'ALL';
      setFilter(val);
      if (onStatusChange) onStatusChange(val);
    },
    [onStatusChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearch(val);
      if (onSearchChange) onSearchChange(val);
    },
    [onSearchChange]
  );

  const handleOpenActionModal = useCallback(
    (leave: LeaveApplication, type: 'APPROVE' | 'REJECT') => {
      setSelectedLeave(leave);
      setActionType(type);
      setComment('');
      setErrorMessage(null);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setSelectedLeave(null);
    setActionType(null);
    setComment('');
    setErrorMessage(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!selectedLeave || !actionType) return;
    setErrorMessage(null);

    try {
      if (actionType === 'APPROVE') {
        await approveMutation.mutateAsync({
          id: selectedLeave._id,
          payload: { adminComment: comment },
        });
      } else {
        await rejectMutation.mutateAsync({
          id: selectedLeave._id,
          payload: { adminComment: comment },
        });
      }
      handleCloseModal();
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to ${actionType.toLowerCase()} application.`);
    }
  }, [selectedLeave, actionType, comment, approveMutation, rejectMutation, handleCloseModal]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return leaves.filter((leave) => {
      const statusMatch =
        filter === 'ALL' || leave.status.toUpperCase() === filter.toUpperCase();

      if (!statusMatch) return false;
      if (!query) return true;

      const empObj = typeof leave.employee === 'object' ? leave.employee : null;
      const name = empObj?.name?.toLowerCase() || '';
      const email = empObj?.email?.toLowerCase() || '';
      const code = empObj?.employeeId?.toLowerCase() || '';
      const reason = leave.reason?.toLowerCase() || '';

      return (
        name.includes(query) ||
        email.includes(query) ||
        code.includes(query) ||
        reason.includes(query)
      );
    });
  }, [leaves, filter, search]);

  return (
    <div className="space-y-4 text-left">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <AppInput
            placeholder="Search employee, email, reason..."
            value={search}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-56">
          <AppSelect
            options={LEAVE_STATUS_OPTIONS}
            value={filter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Leave Records Found"
          description="Try adjusting your search criteria or status filter to see other records."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Employee</th>
                  <th className="py-3.5 px-4">Leave Dates</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((leave) => {
                  const empObj = typeof leave.employee === 'object' ? leave.employee : null;
                  const empName = empObj?.name || 'Unknown';
                  const empEmail = empObj?.email || '';
                  const empDept = empObj?.department || '';
                  const availableBal = empObj?.availableLeave ?? 0;
                  const isPending = leave.status === 'PENDING';
                  const isExceeding = leave.duration > availableBal;

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {empName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{empName}</p>
                            <p className="text-xs text-slate-500 leading-tight">
                              {empEmail} {empDept && `• ${empDept}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800">
                          {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatDuration(leave.duration)}
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate text-xs text-slate-600" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(leave.appliedAt || leave.createdAt)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <AppButton
                              size="small"
                              variant="success"
                              onClick={() => handleOpenActionModal(leave, 'APPROVE')}
                              disabled={isExceeding}
                              title={isExceeding ? 'Exceeds balance' : 'Approve'}
                            >
                              Approve
                            </AppButton>
                            <AppButton
                              size="small"
                              variant="danger"
                              onClick={() => handleOpenActionModal(leave, 'REJECT')}
                            >
                              Reject
                            </AppButton>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Decided</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AppModal
        isOpen={!!selectedLeave && !!actionType}
        onClose={handleCloseModal}
        title={actionType === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
        description={
          actionType === 'APPROVE'
            ? 'Confirm approval and deduct days from employee balance.'
            : 'Reject request without deducting balance.'
        }
      >
        <div className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          <AppTextarea
            label="Admin Comment / Reason (Optional)"
            placeholder="Add any feedback or note..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <AppButton variant="secondary" size="small" onClick={handleCloseModal}>
              Cancel
            </AppButton>
            <AppButton
              variant={actionType === 'APPROVE' ? 'success' : 'danger'}
              size="small"
              isLoading={approveMutation.isPending || rejectMutation.isPending}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={handleConfirmAction}
            >
              {approveMutation.isPending || rejectMutation.isPending
                ? 'Processing...'
                : `Confirm ${actionType === 'APPROVE' ? 'Approval' : 'Rejection'}`}
            </AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
};

export default AdminLeavesTable;

