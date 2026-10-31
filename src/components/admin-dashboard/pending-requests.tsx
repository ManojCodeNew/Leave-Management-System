import React, { useState } from 'react';
import { Calendar, Check, X, MessageSquare, AlertCircle, User } from 'lucide-react';
import { LeaveApplication } from '../../types/leave.types';
import StatusBadge from '../ui/status-badge';
import AppButton from '../ui/buttons/app-button';
import AppModal from '../ui/modals/app-modal';
import AppTextarea from '../ui/inputs/app-textarea';
import EmptyState from '../ui/empty-state';
import { formatDate } from '../../utils/date.utils';
import { formatDuration } from '../../utils/format.utils';
import { useApproveLeave, useRejectLeave } from '../../hooks/use-admin';

export interface PendingRequestsProps {
  pendingLeaves: LeaveApplication[];
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({ pendingLeaves }) => {
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const handleOpenActionModal = (leave: LeaveApplication, type: 'APPROVE' | 'REJECT') => {
    setSelectedLeave(leave);
    setActionType(type);
    setComment('');
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedLeave(null);
    setActionType(null);
    setComment('');
    setErrorMessage(null);
  };

  const handleConfirmAction = async () => {
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
  };

  const isPendingAction = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Pending Leave Requests</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Applications awaiting your review and decision ({pendingLeaves.length})
          </p>
        </div>
      </div>

      {pendingLeaves.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="All Clear!"
            description="There are no pending leave applications awaiting review right now."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {pendingLeaves.map((leave) => {
            const employeeObj = typeof leave.employee === 'object' ? leave.employee : null;
            const empName = employeeObj?.name || 'Unknown Employee';
            const empEmail = employeeObj?.email || '';
            const empDept = employeeObj?.department || '';
            const availableBal = employeeObj?.availableLeave ?? 0;

            const isExceeding = leave.duration > availableBal;

            return (
              <div
                key={leave._id}
                className="p-5 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Employee & Leave Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {empName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{empName}</h4>
                      <p className="text-xs text-slate-500">
                        {empEmail} {empDept && `• ${empDept}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-sm text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                      </span>
                    </div>
                    <span className="font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                      {formatDuration(leave.duration)}
                    </span>
                    <span className="text-xs text-slate-500">
                      (Available Balance: <strong className={isExceeding ? 'text-rose-600' : 'text-slate-800'}>{availableBal} Days</strong>)
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Reason: </span>
                    <span>{leave.reason}</span>
                  </div>

                  {isExceeding && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Warning: Requested days exceed employee available balance!</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                  <AppButton
                    size="small"
                    variant="success"
                    icon={<Check className="w-4 h-4" />}
                    onClick={() => handleOpenActionModal(leave, 'APPROVE')}
                    disabled={isExceeding}
                    title={isExceeding ? 'Cannot approve: exceeds available balance' : 'Approve leave'}
                  >
                    Approve
                  </AppButton>
                  <AppButton
                    size="small"
                    variant="danger"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => handleOpenActionModal(leave, 'REJECT')}
                  >
                    Reject
                  </AppButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation & Note Modal */}
      <AppModal
        isOpen={!!selectedLeave && !!actionType}
        onClose={handleCloseModal}
        title={actionType === 'APPROVE' ? 'Approve Leave Application' : 'Reject Leave Application'}
        description={
          actionType === 'APPROVE'
            ? 'This will deduct the requested days from employee balance and mark the application as approved.'
            : 'This will reject the application without affecting employee leave balance.'
        }
      >
        <div className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {selectedLeave && (
            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <p>
                <strong>Employee:</strong>{' '}
                {typeof selectedLeave.employee === 'object' ? selectedLeave.employee.name : 'Employee'}
              </p>
              <p>
                <strong>Duration:</strong> {formatDuration(selectedLeave.duration)} (
                {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)})
              </p>
              <p>
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
            </div>
          )}

          <AppTextarea
            label="Administrator Comment / Feedback (Optional)"
            placeholder={
              actionType === 'APPROVE'
                ? 'e.g. Approved. Have a good break!'
                : 'e.g. Please reschedule due to ongoing project milestone.'
            }
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <AppButton variant="secondary" size="small" onClick={handleCloseModal}>
              Cancel
            </AppButton>
            <AppButton
              variant={actionType === 'APPROVE' ? 'success' : 'danger'}
              size="small"
              isLoading={isPendingAction}
              onClick={handleConfirmAction}
            >
              Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
            </AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
};

export default PendingRequests;

