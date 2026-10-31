import { User } from './auth.types';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveApplication {
  _id: string;
  employee: User | string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeavePayload {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveBalanceSummary {
  leaveAllocation: number;
  usedLeave: number;
  availableLeave: number;
  pendingDays: number;
  pendingRequestsCount: number;
}

export interface EmployeeDashboardData {
  employee: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    department: string;
  };
  balance: LeaveBalanceSummary;
  recentApplications: LeaveApplication[];
}

