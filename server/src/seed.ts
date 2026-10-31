import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { LeaveApplication } from './models/leave-application.model.js';
import { parseUTCStartOfDay, parseUTCEndOfDay } from './controllers/leave.controller.js';

dotenv.config();

const seedData = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to database.');

    // Clear existing collections
    await User.deleteMany({});
    await LeaveApplication.deleteMany({});
    console.log('[Seed] Cleared existing Users and LeaveApplications.');

    // 1. Create Admin
    const admin = await User.create({
      employeeId: 'ADM-001',
      name: 'System Administrator',
      email: 'admin@exelon.com',
      password: 'admin123',
      role: 'ADMIN',
      department: 'Management',
      leaveAllocation: 25,
      usedLeave: 0,
      availableLeave: 25,
    });
    console.log('[Seed] Created Admin:', admin.email);

    // 2. Create Employees
    const emp1 = await User.create({
      employeeId: 'EMP-101',
      name: 'Manoj Poojary',
      email: 'employee@exelon.com',
      password: 'employee123',
      role: 'EMPLOYEE',
      department: 'Software Engineering',
      leaveAllocation: 20,
      usedLeave: 2, // 2 days already approved (Oct 10 Saturday & Oct 12 Monday, Sunday Oct 11 excluded)
      availableLeave: 18,
    });

    const emp2 = await User.create({
      employeeId: 'EMP-102',
      name: 'Sarah Smith',
      email: 'sarah.smith@exelon.com',
      password: 'employee123',
      role: 'EMPLOYEE',
      department: 'UI/UX Design',
      leaveAllocation: 15,
      usedLeave: 0,
      availableLeave: 15,
    });

    const emp3 = await User.create({
      employeeId: 'EMP-103',
      name: 'Alex Turner',
      email: 'alex.turner@exelon.com',
      password: 'employee123',
      role: 'EMPLOYEE',
      department: 'Quality Assurance',
      leaveAllocation: 18,
      usedLeave: 4,
      availableLeave: 14,
    });

    console.log('[Seed] Created 3 Employees.');

    // 3. Create Sample Leave Applications
    // Manoj's approved leave: Oct 10 (Sat) to Oct 12 (Mon) -> 2 working days (Sunday Oct 11 excluded)
    await LeaveApplication.create({
      employee: emp1._id,
      startDate: parseUTCStartOfDay('2026-10-10'),
      endDate: parseUTCEndOfDay('2026-10-12'),
      duration: 2,
      reason: 'Attending family wedding ceremony.',
      status: 'APPROVED',
      appliedAt: new Date('2026-10-01'),
      reviewedBy: admin._id,
      reviewedAt: new Date('2026-10-02'),
      adminComment: 'Approved. Enjoy the family function!',
    });

    // Manoj's pending leave: Nov 17 (Tue) to Nov 18 (Wed) -> 2 working days
    await LeaveApplication.create({
      employee: emp1._id,
      startDate: parseUTCStartOfDay('2026-11-17'),
      endDate: parseUTCEndOfDay('2026-11-18'),
      duration: 2,
      reason: 'Personal medical checkup and routine consultation.',
      status: 'PENDING',
      appliedAt: new Date('2026-10-28'),
    });

    // Sarah's pending leave: Nov 23 (Mon) to Nov 25 (Wed) -> 3 working days
    await LeaveApplication.create({
      employee: emp2._id,
      startDate: parseUTCStartOfDay('2026-11-23'),
      endDate: parseUTCEndOfDay('2026-11-25'),
      duration: 3,
      reason: 'Annual family holiday trip.',
      status: 'PENDING',
      appliedAt: new Date('2026-10-29'),
    });

    // Alex's approved leave: Sep 07 (Mon) to Sep 10 (Thu) -> 4 working days
    await LeaveApplication.create({
      employee: emp3._id,
      startDate: parseUTCStartOfDay('2026-09-07'),
      endDate: parseUTCEndOfDay('2026-09-10'),
      duration: 4,
      reason: 'Home renovation and relocation.',
      status: 'APPROVED',
      appliedAt: new Date('2026-08-25'),
      reviewedBy: admin._id,
      reviewedAt: new Date('2026-08-26'),
      adminComment: 'Approved as per team schedule.',
    });

    // Alex's rejected leave: Oct 02 (Fri) to Oct 07 (Wed) -> 5 working days (Sun Oct 4 excluded)
    await LeaveApplication.create({
      employee: emp3._id,
      startDate: parseUTCStartOfDay('2026-10-02'),
      endDate: parseUTCEndOfDay('2026-10-07'),
      duration: 5,
      reason: 'Urgent unplanned personal travel.',
      status: 'REJECTED',
      appliedAt: new Date('2026-09-28'),
      reviewedBy: admin._id,
      reviewedAt: new Date('2026-09-29'),
      adminComment: 'Rejected due to critical release sprint during this period.',
    });

    console.log('[Seed] Created sample leave applications with Sunday exclusion and normalized boundaries.');
    console.log('----------------------------------------------------');
    console.log('Default credentials for testing:');
    console.log('ADMIN:    admin@exelon.com    / admin123');
    console.log('EMPLOYEE: employee@exelon.com / employee123');
    console.log('EMPLOYEE: sarah.smith@exelon.com / employee123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    console.log('[Seed] Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
