import { Response } from 'express';
import mongoose from 'mongoose';
import { LeaveApplication } from '../models/leave-application.model.js';
import { User } from '../models/user.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE' });

    const totalRequests = await LeaveApplication.countDocuments();
    const pendingRequests = await LeaveApplication.countDocuments({ status: 'PENDING' });
    const approvedRequests = await LeaveApplication.countDocuments({ status: 'APPROVED' });
    const rejectedRequests = await LeaveApplication.countDocuments({ status: 'REJECTED' });

    // Sum of approved leave days
    const approvedDaysResult = await LeaveApplication.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, totalDays: { $sum: '$duration' } } },
    ]);
    const totalApprovedDays = approvedDaysResult[0]?.totalDays || 0;

    // Recent 5 leave requests
    const recentRequests = await LeaveApplication.find()
      .sort({ appliedAt: -1 })
      .limit(6)
      .populate('employee', 'name email employeeId department availableLeave');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalApprovedDays,
        },
        recentRequests,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin dashboard statistics.',
    });
  }
};

export const getAllLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, employeeId, search } = req.query;

    const filter: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(status).toUpperCase())) {
      filter.status = String(status).toUpperCase();
    }
    if (employeeId && mongoose.isValidObjectId(employeeId)) {
      filter.employee = employeeId;
    }

    let leaves = await LeaveApplication.find(filter)
      .sort({ appliedAt: -1 })
      .populate('employee', 'name email employeeId department availableLeave usedLeave leaveAllocation')
      .populate('reviewedBy', 'name email');

    // Optional text search filter by employee name or email
    if (search) {
      const term = String(search).toLowerCase();
      leaves = leaves.filter((item: any) => {
        const empName = item.employee?.name?.toLowerCase() || '';
        const empEmail = item.employee?.email?.toLowerCase() || '';
        const empCode = item.employee?.employeeId?.toLowerCase() || '';
        return empName.includes(term) || empEmail.includes(term) || empCode.includes(term);
      });
    }

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leave applications.',
    });
  }
};

export const approveLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    const adminId = req.user?._id;

    const leave = await LeaveApplication.findById(id);
    if (!leave) {
      res.status(404).json({
        success: false,
        message: 'Leave application not found.',
      });
      return;
    }

    if (leave.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: `Cannot approve application. Current status is already ${leave.status}.`,
      });
      return;
    }

    const employee = await User.findById(leave.employee);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Associated employee record not found.',
      });
      return;
    }

    // Ensure employee has sufficient available balance
    if (employee.availableLeave < leave.duration) {
      res.status(400).json({
        success: false,
        message: `Cannot approve leave. Employee only has ${employee.availableLeave} day(s) available, but requested ${leave.duration} day(s).`,
      });
      return;
    }

    // Ensure no overlapping approved leave exists for this employee
    const overlapping = await LeaveApplication.findOne({
      _id: { $ne: leave._id },
      employee: leave.employee,
      status: 'APPROVED',
      startDate: { $lte: leave.endDate },
      endDate: { $gte: leave.startDate },
    });

    if (overlapping) {
      const s = overlapping.startDate.toISOString().split('T')[0];
      const e = overlapping.endDate.toISOString().split('T')[0];
      res.status(400).json({
        success: false,
        message: `Cannot approve leave. It overlaps with an already approved leave (${s} to ${e}).`,
      });
      return;
    }

    // Deduct leave balance accurately
    employee.usedLeave += leave.duration;
    employee.availableLeave = Math.max(0, employee.leaveAllocation - employee.usedLeave);
    await employee.save();

    // Update leave application
    leave.status = 'APPROVED';
    leave.reviewedBy = adminId;
    leave.reviewedAt = new Date();
    if (adminComment) {
      leave.adminComment = adminComment.trim();
    }
    await leave.save();

    await leave.populate('employee', 'name email employeeId department availableLeave usedLeave leaveAllocation');
    await leave.populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Leave application approved successfully. Deducted ${leave.duration} day(s). Remaining balance: ${employee.availableLeave} day(s).`,
      data: {
        leave,
        updatedEmployee: {
          id: employee._id,
          leaveAllocation: employee.leaveAllocation,
          usedLeave: employee.usedLeave,
          availableLeave: employee.availableLeave,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve leave application.',
    });
  }
};

export const rejectLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    const adminId = req.user?._id;

    const leave = await LeaveApplication.findById(id);
    if (!leave) {
      res.status(404).json({
        success: false,
        message: 'Leave application not found.',
      });
      return;
    }

    if (leave.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: `Cannot reject application. Current status is already ${leave.status}.`,
      });
      return;
    }

    // Update leave application without modifying leave balance
    leave.status = 'REJECTED';
    leave.reviewedBy = adminId;
    leave.reviewedAt = new Date();
    if (adminComment) {
      leave.adminComment = adminComment.trim();
    }
    await leave.save();

    await leave.populate('employee', 'name email employeeId department availableLeave usedLeave leaveAllocation');
    await leave.populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Leave application rejected successfully. Employee leave balance preserved.',
      data: {
        leave,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject leave application.',
    });
  }
};

export const getAllEmployees = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await User.find({ role: 'EMPLOYEE' })
      .select('-password')
      .sort({ name: 1 });

    // Enrich with count of pending, approved, and rejected leaves
    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const pendingCount = await LeaveApplication.countDocuments({
          employee: emp._id,
          status: 'PENDING',
        });
        const approvedCount = await LeaveApplication.countDocuments({
          employee: emp._id,
          status: 'APPROVED',
        });
        const rejectedCount = await LeaveApplication.countDocuments({
          employee: emp._id,
          status: 'REJECTED',
        });

        return {
          id: emp._id,
          employeeId: emp.employeeId,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          leaveAllocation: emp.leaveAllocation,
          usedLeave: emp.usedLeave,
          availableLeave: emp.availableLeave,
          createdAt: emp.createdAt,
          stats: {
            pendingCount,
            approvedCount,
            rejectedCount,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedEmployees.length,
      data: enrichedEmployees,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employees list.',
    });
  }
};

