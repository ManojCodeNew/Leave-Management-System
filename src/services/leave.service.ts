import api from './api/axios-instance';
import { ENDPOINTS } from '../config/endpoints';
import {
  LeaveApplication,
  CreateLeavePayload,
  EmployeeDashboardData,
  LeaveStatus,
} from '../types/leave.types';

export const leaveService = {
  createLeave: async (payload: CreateLeavePayload): Promise<LeaveApplication> => {
    const response = await api.post(ENDPOINTS.leave.create, payload);
    return response.data.data;
  },

  getMyLeaves: async (status?: LeaveStatus | 'ALL'): Promise<LeaveApplication[]> => {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await api.get(ENDPOINTS.leave.list, { params });
    return response.data.data;
  },

  getMyBalance: async (): Promise<EmployeeDashboardData> => {
    const response = await api.get(ENDPOINTS.leave.balance);
    return response.data.data;
  },

  getLeaveById: async (id: string): Promise<LeaveApplication> => {
    const response = await api.get(ENDPOINTS.leave.details(id));
    return response.data.data;
  },
};

