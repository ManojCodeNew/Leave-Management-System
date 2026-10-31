import { LeaveApplication } from './leave.types';

export interface AdminOverviewStats {
  totalEmployees: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalApprovedDays: number;
}

export interface AdminDashboardData {
  overview: AdminOverviewStats;
  recentRequests: LeaveApplication[];
}

export interface LeaveReviewPayload {
  adminComment?: string;
}

