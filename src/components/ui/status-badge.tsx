import React from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { LeaveStatus } from '../../types/leave.types';

export interface StatusBadgeProps {
  status: LeaveStatus | string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const normStatus = (status || '').toUpperCase() as LeaveStatus;

  const config = {
    PENDING: {
      label: 'Pending',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
    APPROVED: {
      label: 'Approved',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
    REJECTED: {
      label: 'Rejected',
      icon: <XCircle className="w-3.5 h-3.5" />,
      classes: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
  }[normStatus] || {
    label: normStatus,
    icon: null,
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${config.classes} ${sizeClasses}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

