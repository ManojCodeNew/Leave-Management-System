import { CreateLeavePayload } from '../types/leave.types';
import { calculateLeaveDays } from '../utils/date.utils';
import { ValidationErrors } from './auth.validation';

export const validateLeaveApplication = (
  payload: CreateLeavePayload,
  availableBalance: number
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!payload.startDate) {
    errors.startDate = 'Start date is required.';
  }

  if (!payload.endDate) {
    errors.endDate = 'End date is required.';
  }

  if (payload.startDate && payload.endDate) {
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);

    if (end < start) {
      errors.endDate = 'End date cannot be earlier than start date.';
    } else {
      const days = calculateLeaveDays(payload.startDate, payload.endDate);
      if (days <= 0) {
        errors.endDate = 'Duration must be at least 1 day.';
      } else if (days > availableBalance) {
        errors.endDate = `Requested duration (${days} days) exceeds available balance (${availableBalance} days).`;
      }
    }
  }

  if (!payload.reason || !payload.reason.trim()) {
    errors.reason = 'Reason for leave is required.';
  } else if (payload.reason.trim().length < 5) {
    errors.reason = 'Reason must be at least 5 characters.';
  } else if (payload.reason.trim().length > 500) {
    errors.reason = 'Reason cannot exceed 500 characters.';
  }

  return errors;
};

