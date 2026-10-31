import api from './api/axios-instance';
import { ENDPOINTS } from '../config/endpoints';
import {
  LeaveApplication,
  CreateLeavePayload,
  EmployeeDashboardData,
  LeaveStatus,
} from '../types/leave.types';
import { PaginatedResult } from '../types/pagination.types';

export const leaveService = {
  createLeave: async (payload: CreateLeavePayload): Promise<LeaveApplication> => {
    const response = await api.post(ENDPOINTS.leave.create, payload);
    return response.data.data;
  },

  getMyLeaves: async (status?: LeaveStatus | 'ALL'): Promise<LeaveApplication[]> => {
    const params = status && status !== 'ALL' ? { status, limit: 100 } : { limit: 100 };
    const response = await api.get(ENDPOINTS.leave.list, { params });
    return response.data.data;
  },

  getMyLeavesPaginated: async (options?: {
    status?: LeaveStatus | 'ALL';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<LeaveApplication>> => {
    const params: Record<string, any> = {
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
    if (options?.status && options.status !== 'ALL') {
      params.status = options.status;
    }
    if (options?.search && options.search.trim()) {
      params.search = options.search.trim();
    }

    const response = await api.get(ENDPOINTS.leave.list, { params });
    return {
      items: response.data.data || [],
      meta: response.data.meta || {
        totalCount: response.data.count || 0,
        totalPages: 1,
        currentPage: options?.page || 1,
        limit: options?.limit || 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
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


