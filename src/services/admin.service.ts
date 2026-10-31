import api from './api/axios-instance';
import { ENDPOINTS } from '../config/endpoints';
import { AdminDashboardData, LeaveReviewPayload } from '../types/admin.types';
import { LeaveApplication, LeaveStatus } from '../types/leave.types';
import { EmployeeOverviewItem } from '../types/employee.types';

export const adminService = {
  getDashboardData: async (): Promise<AdminDashboardData> => {
    const response = await api.get(ENDPOINTS.admin.dashboard);
    return response.data.data;
  },

  getAllLeaves: async (
    status?: LeaveStatus | 'ALL',
    search?: string
  ): Promise<LeaveApplication[]> => {
    const params: Record<string, string> = {};
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;

    const response = await api.get(ENDPOINTS.admin.leaves, { params });
    return response.data.data;
  },

  approveLeave: async (
    id: string,
    payload?: LeaveReviewPayload
  ): Promise<{ leave: LeaveApplication }> => {
    const response = await api.post(ENDPOINTS.admin.approveLeave(id), payload || {});
    return response.data.data;
  },

  rejectLeave: async (
    id: string,
    payload?: LeaveReviewPayload
  ): Promise<{ leave: LeaveApplication }> => {
    const response = await api.post(ENDPOINTS.admin.rejectLeave(id), payload || {});
    return response.data.data;
  },

  getAllEmployees: async (): Promise<EmployeeOverviewItem[]> => {
    const response = await api.get(ENDPOINTS.admin.employees);
    return response.data.data;
  },
};

