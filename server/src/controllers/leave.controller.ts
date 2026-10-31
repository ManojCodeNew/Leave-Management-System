import { Response } from 'express';
import { LeaveApplication } from '../models/leave-application.model.js';
import { User } from '../models/user.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Convert date string (YYYY-MM-DD) to UTC Start of Day (00:00:00.000)
export const parseUTCStartOfDay = (dateInput: string | Date): Date => {
  const dateStr =
    typeof dateInput === 'string'
      ? dateInput.split('T')[0]
      : dateInput.toISOString().split('T')[0];
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

// Convert date string (YYYY-MM-DD) to UTC End of Day (23:59:59.999)
export const parseUTCEndOfDay = (dateInput: string | Date): Date => {
  const dateStr =
    typeof dateInput === 'string'
      ? dateInput.split('T')[0]
      : dateInput.toISOString().split('T')[0];
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
};

// Calculate leave days between start and end dates inclusive, strictly excluding Sundays
export const calculateDurationExcludingSundays = (
  startDate: string | Date,
  endDate: string | Date
): { duration: number; sundayCount: number } => {
  const start = parseUTCStartOfDay(startDate);
  const end = parseUTCEndOfDay(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { duration: 0, sundayCount: 0 };
  }

  let duration = 0;
  let sundayCount = 0;
  const current = new Date(start);

  while (current <= end) {
    if (current.getUTCDay() === 0) {
      // 0 represents Sunday in UTC: non-working day
      sundayCount++;
    } else {
      // Monday through Saturday are eligible working days
      duration++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return { duration, sundayCount };
};

export const calculateDuration = (startDate: string | Date, endDate: string | Date): number => {
  return calculateDurationExcludingSundays(startDate, endDate).duration;
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

    const start = parseUTCStartOfDay(startDate);
    const end = parseUTCEndOfDay(endDate);

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

    // Requirement: Sunday Restrictions
    if (start.getUTCDay() === 0) {
      res.status(400).json({
        success: false,
        message: 'Leave start date cannot be a Sunday. Sundays are non-working days.',
      });
      return;
    }

    if (end.getUTCDay() === 0) {
      res.status(400).json({
        success: false,
        message: 'Leave end date cannot be a Sunday. Sundays are non-working days.',
      });
      return;
    }

    // Requirement: Exclude Sundays from requested duration
    const { duration, sundayCount } = calculateDurationExcludingSundays(start, end);
    if (duration <= 0) {
      res.status(400).json({
        success: false,
        message: 'Requested leave range contains zero working days (excluding Sundays).',
      });
      return;
    }

    // Requirement: Prevent Overlapping with Approved Leave Applications
    const overlappingApproved = await LeaveApplication.findOne({
      employee: employeeId,
      status: 'APPROVED',
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingApproved) {
      const startStr = overlappingApproved.startDate.toISOString().split('T')[0];
      const endStr = overlappingApproved.endDate.toISOString().split('T')[0];
      res.status(400).json({
        success: false,
        message: `The selected dates overlap with an existing approved leave application (${startStr} to ${endStr}). Applications overlapping with approved leaves are not allowed.`,
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
        message: `Requested duration of ${duration} working day(s) exceeds your available leave balance of ${employee.availableLeave} day(s).`,
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
      message: `Leave application submitted successfully for ${duration} working day(s)${
        sundayCount > 0 ? ` (${sundayCount} Sunday excluded)` : ''
      }.`,
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

    // Fetch approved leaves for date disabling in frontend calendar
    const approvedLeaves = await LeaveApplication.find({
      employee: employeeId,
      status: 'APPROVED',
    }).select('startDate endDate duration reason');

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
        approvedLeaves: approvedLeaves.map((l) => ({
          _id: l._id,
          startDate: l.startDate,
          endDate: l.endDate,
          duration: l.duration,
          reason: l.reason,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leave balance.',
    });
  }
};
