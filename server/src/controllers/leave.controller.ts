import { Response } from 'express';
import { LeaveApplication } from '../models/leave-application.model.js';
import { User } from '../models/user.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Helper to calculate days between dates inclusive
export const calculateDuration = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const createLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, reason } = req.body;
    const employeeId = req.user?._id;

    if (!startDate || !endDate || !reason) {
      res.status(400).json({
        success: false,
        message: 'Start date, end date, and reason are required.',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid start date or end date format.',
      });
      return;
    }

    if (end < start) {
      res.status(400).json({
        success: false,
        message: 'Leave end date cannot be earlier than start date.',
      });
      return;
    }

    const duration = calculateDuration(start, end);
    if (duration <= 0) {
      res.status(400).json({
        success: false,
        message: 'Leave duration must be at least 1 day.',
      });
      return;
    }

    // Refresh employee to check current balance
    const employee = await User.findById(employeeId);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
      return;
    }

    if (duration > employee.availableLeave) {
      res.status(400).json({
        success: false,
        message: `Requested duration of ${duration} day(s) exceeds your available leave balance of ${employee.availableLeave} day(s).`,
      });
      return;
    }

    const newLeave = await LeaveApplication.create({
      employee: employeeId,
      startDate: start,
      endDate: end,
      duration,
      reason: reason.trim(),
      status: 'PENDING',
      appliedAt: new Date(),
    });

    await newLeave.populate('employee', 'name email employeeId department');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      data: newLeave,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit leave application.',
    });
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employeeId = req.user?._id;
    const { status } = req.query;

    const filter: any = { employee: employeeId };
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(status).toUpperCase())) {
      filter.status = String(status).toUpperCase();
    }

    const leaves = await LeaveApplication.find(filter)
      .sort({ appliedAt: -1 })
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leave history.',
    });
  }
};

export const getLeaveById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leave = await LeaveApplication.findById(id)
      .populate('employee', 'name email employeeId department leaveAllocation availableLeave usedLeave')
      .populate('reviewedBy', 'name email');

    if (!leave) {
      res.status(404).json({
        success: false,
        message: 'Leave application not found.',
      });
      return;
    }

    // Role check: Employee can only view their own leave
    if (req.user?.role === 'EMPLOYEE' && String(leave.employee._id) !== String(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this leave application.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leave application details.',
    });
  }
};

export const getMyBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employeeId = req.user?._id;
    const user = await User.findById(employeeId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
      return;
    }

    // Calculate pending leave requests and pending days
    const pendingLeaves = await LeaveApplication.find({
      employee: employeeId,
      status: 'PENDING',
    });

    const pendingDays = pendingLeaves.reduce((acc, curr) => acc + curr.duration, 0);

    // Get recent leave applications (last 5)
    const recentLeaves = await LeaveApplication.find({ employee: employeeId })
      .sort({ appliedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        employee: {
          id: user._id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          department: user.department,
        },
        balance: {
          leaveAllocation: user.leaveAllocation,
          usedLeave: user.usedLeave,
          availableLeave: user.availableLeave,
          pendingDays,
          pendingRequestsCount: pendingLeaves.length,
        },
        recentApplications: recentLeaves,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leave balance.',
    });
  }
};

