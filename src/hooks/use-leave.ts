import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '../services/leave.service';
import { CreateLeavePayload, LeaveStatus } from '../types/leave.types';

export const useLeaveBalance = () => {
  return useQuery({
    queryKey: ['leaveBalance'],
    queryFn: leaveService.getMyBalance,
  });
};

export const useMyLeaves = (status?: LeaveStatus | 'ALL') => {
  return useQuery({
    queryKey: ['myLeaves', status || 'ALL'],
    queryFn: () => leaveService.getMyLeaves(status),
  });
};

export const useApplyLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLeavePayload) => leaveService.createLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
    },
  });
};

