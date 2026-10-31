export const APP_NAME = 'LeaveMate';
export const APP_DESCRIPTION = 'Enterprise Leave Management System';

export const LEAVE_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const NAVIGATION_LINKS = {
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard' },
    { label: 'Apply Leave', path: '/employee/apply' },
    { label: 'Leave History', path: '/employee/history' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Manage Leaves', path: '/admin/leaves' },
    { label: 'Employees', path: '/admin/employees' },
  ],
};

