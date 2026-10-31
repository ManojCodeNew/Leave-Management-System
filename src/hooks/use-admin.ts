import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { LeaveStatus } from '../types/leave.types';
import { LeaveReviewPayload } from '../types/admin.types';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboardData,
  });
};

export const useAdminLeaves = (status?: LeaveStatus | 'ALL', search?: string) => {
  return useQuery({
    queryKey: ['adminLeaves', status || 'ALL', search || ''],
    queryFn: () => adminService.getAllLeaves(status, search),
  });
};

export const useAdminEmployees = () => {
  return useQuery({
    queryKey: ['adminEmployees'],
    queryFn: adminService.getAllEmployees,
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: LeaveReviewPayload }) =>
      adminService.approveLeave(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: LeaveReviewPayload }) =>
      adminService.rejectLeave(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
    },
  });
};

