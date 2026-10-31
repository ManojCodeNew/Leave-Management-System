import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
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

export const useInfiniteAdminLeaves = (
  status?: LeaveStatus | 'ALL',
  search?: string,
  limit: number = 8
) => {
  return useInfiniteQuery({
    queryKey: ['adminLeavesInfinite', status || 'ALL', search || ''],
    queryFn: ({ pageParam = 1 }) =>
      adminService.getAllLeavesPaginated({
        status,
        search,
        page: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
  });
};

export const useAdminEmployees = () => {
  return useQuery({
    queryKey: ['adminEmployees'],
    queryFn: adminService.getAllEmployees,
  });
};

export const useInfiniteAdminEmployees = (search?: string, limit: number = 8) => {
  return useInfiniteQuery({
    queryKey: ['adminEmployeesInfinite', search || ''],
    queryFn: ({ pageParam = 1 }) =>
      adminService.getAllEmployeesPaginated({
        search,
        page: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
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
      queryClient.invalidateQueries({ queryKey: ['adminLeavesInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployeesInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['myLeavesInfinite'] });
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
      queryClient.invalidateQueries({ queryKey: ['adminLeavesInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployeesInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['myLeavesInfinite'] });
    },
  });
};


