import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { leaveService } from '../services/leave.service';
import { CreateLeavePayload, LeaveStatus } from '../types/leave.types';
import { useAuth } from './use-auth';

export const useLeaveBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['leaveBalance', user?.id],
    queryFn: leaveService.getMyBalance,
    enabled: !!user?.id,
  });
};

export const useMyLeaves = (status?: LeaveStatus | 'ALL') => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['myLeaves', user?.id, status || 'ALL'],
    queryFn: () => leaveService.getMyLeaves(status),
    enabled: !!user?.id,
  });
};

export const useInfiniteMyLeaves = (
  status?: LeaveStatus | 'ALL',
  search?: string,
  limit: number = 8
) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ['myLeavesInfinite', user?.id, status || 'ALL', search || ''],
    queryFn: ({ pageParam = 1 }) =>
      leaveService.getMyLeavesPaginated({
        status,
        search,
        page: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
    enabled: !!user?.id,
  });
};

export const useApplyLeave = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateLeavePayload) => leaveService.createLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveBalance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['myLeavesInfinite', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['adminLeavesInfinite'] });
    },
  });
};

