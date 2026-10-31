import mongoose, { Document, Schema, Types } from 'mongoose';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ILeaveApplication extends Document {
  employee: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  reason: string;
  status: LeaveStatus;
  appliedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveApplicationSchema = new Schema<ILeaveApplication>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    adminComment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveApplication = mongoose.model<ILeaveApplication>(
  'LeaveApplication',
  LeaveApplicationSchema
);

