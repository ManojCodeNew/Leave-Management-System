import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, PlusCircle, History } from 'lucide-react';
import { LeaveApplication } from '../../types/leave.types';
import StatusBadge from '../ui/status-badge';
import AppButton from '../ui/buttons/app-button';
import EmptyState from '../ui/empty-state';
import { formatDate } from '../../utils/date.utils';
import { formatDuration } from '../../utils/format.utils';

export interface RecentLeaveRequestsProps {
  applications: LeaveApplication[];
  onOpenApplyModal?: () => void;
}

export const RecentLeaveRequests: React.FC<RecentLeaveRequestsProps> = ({
  applications,
  onOpenApplyModal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Recent Applications</h3>
          <p className="text-xs text-slate-500 mt-0.5">Your most recent leave submissions</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenApplyModal ? (
            <AppButton
              size="small"
              variant="primary"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={onOpenApplyModal}
            >
              Apply Leave
            </AppButton>
          ) : (
            <AppButton
              size="small"
              variant="primary"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/employee/apply')}
            >
              Apply Leave
            </AppButton>
          )}

          <AppButton
            size="small"
            variant="secondary"
            icon={<History className="w-4 h-4" />}
            onClick={() => navigate('/employee/history')}
          >
            View All
          </AppButton>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No Recent Applications"
            description="You don't have any recent leave applications. Apply for a leave whenever needed."
            actionLabel="Submit First Leave"
            onAction={onOpenApplyModal || (() => navigate('/employee/apply'))}
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {applications.map((leave) => (
            <div
              key={leave._id}
              className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {formatDuration(leave.duration)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">{leave.reason}</p>
                {leave.adminComment && (
                  <p className="text-[11px] text-slate-400 italic">
                    Note: &quot;{leave.adminComment}&quot;
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <StatusBadge status={leave.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentLeaveRequests;

