export interface EmployeeOverviewItem {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  leaveAllocation: number;
  usedLeave: number;
  availableLeave: number;
  createdAt: string;
  stats: {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

