import api from './api/axios-instance';
import { ENDPOINTS } from '../config/endpoints';
import { EmployeeDashboardData } from '../types/leave.types';

export const employeeService = {
  getProfileAndBalance: async (): Promise<EmployeeDashboardData> => {
    const response = await api.get(ENDPOINTS.leave.balance);
    return response.data.data;
  },
};

