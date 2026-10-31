import api from './api/axios-instance';
import { ENDPOINTS } from '../config/endpoints';
import { AdminDashboardData, LeaveReviewPayload } from '../types/admin.types';
import { LeaveApplication, LeaveStatus } from '../types/leave.types';
import { EmployeeOverviewItem } from '../types/employee.types';
import { PaginatedResult } from '../types/pagination.types';

export const adminService = {
  getDashboardData: async (): Promise<AdminDashboardData> => {
    const response = await api.get(ENDPOINTS.admin.dashboard);
    return response.data.data;
  },

  getAllLeaves: async (
    status?: LeaveStatus | 'ALL',
    search?: string
  ): Promise<LeaveApplication[]> => {
    const params: Record<string, string> = { limit: '100' };
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;

    const response = await api.get(ENDPOINTS.admin.leaves, { params });
    return response.data.data;
  },

  getAllLeavesPaginated: async (options?: {
    status?: LeaveStatus | 'ALL';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<LeaveApplication>> => {
    const params: Record<string, any> = {
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
    if (options?.status && options.status !== 'ALL') params.status = options.status;
    if (options?.search && options.search.trim()) params.search = options.search.trim();

    const response = await api.get(ENDPOINTS.admin.leaves, { params });
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
    const response = await api.get(ENDPOINTS.admin.employees, { params: { limit: 100 } });
    return response.data.data;
  },

  getAllEmployeesPaginated: async (options?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<EmployeeOverviewItem>> => {
    const params: Record<string, any> = {
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
    if (options?.search && options.search.trim()) params.search = options.search.trim();

    const response = await api.get(ENDPOINTS.admin.employees, { params });
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
};


