import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { LeaveApplication } from './models/leave-application.model.js';

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
      usedLeave: 3, // 3 days already approved
      availableLeave: 17,
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
    // Manoj's approved leave
    await LeaveApplication.create({
      employee: emp1._id,
      startDate: new Date('2026-10-10'),
      endDate: new Date('2026-10-12'),
      duration: 3,
      reason: 'Attending family wedding ceremony.',
      status: 'APPROVED',
      appliedAt: new Date('2026-10-01'),
      reviewedBy: admin._id,
      reviewedAt: new Date('2026-10-02'),
      adminComment: 'Approved. Enjoy the family function!',
    });

    // Manoj's pending leave
    await LeaveApplication.create({
      employee: emp1._id,
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-16'),
      duration: 2,
      reason: 'Personal medical checkup and routine consultation.',
      status: 'PENDING',
      appliedAt: new Date('2026-10-28'),
    });

    // Sarah's pending leave
    await LeaveApplication.create({
      employee: emp2._id,
      startDate: new Date('2026-11-20'),
      endDate: new Date('2026-11-22'),
      duration: 3,
      reason: 'Annual family holiday trip.',
      status: 'PENDING',
      appliedAt: new Date('2026-10-29'),
    });

    // Alex's approved leave
    await LeaveApplication.create({
      employee: emp3._id,
      startDate: new Date('2026-09-05'),
      endDate: new Date('2026-09-08'),
      duration: 4,
      reason: 'Home renovation and relocation.',
      status: 'APPROVED',
      appliedAt: new Date('2026-08-25'),
      reviewedBy: admin._id,
      reviewedAt: new Date('2026-08-26'),
      adminComment: 'Approved as per team schedule.',
    });

    // Alex's rejected leave
    await LeaveApplication.create({
      employee: emp3._id,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-05'),
      duration: 5,
      reason: 'Urgent unplanned trip.',
      status: 'REJECTED',
      appliedAt: new Date('2026-09-28'),
      reviewedBy: admin._id,
      reviewedAt: new Date('2026-09-29'),
      adminComment: 'Rejected due to critical release sprint during this period.',
    });

    console.log('[Seed] Created sample leave applications with diverse statuses.');
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

