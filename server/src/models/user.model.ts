import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'EMPLOYEE' | 'ADMIN';

export interface IUser extends Document {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  leaveAllocation: number;
  usedLeave: number;
  availableLeave: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['EMPLOYEE', 'ADMIN'],
      default: 'EMPLOYEE',
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    leaveAllocation: {
      type: Number,
      default: 20,
      min: 0,
    },
    usedLeave: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableLeave: {
      type: Number,
      default: 20,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);

