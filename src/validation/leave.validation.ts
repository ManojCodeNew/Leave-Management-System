import { CreateLeavePayload } from '../types/leave.types';
import {
  calculateLeaveDays,
  isSunday,
  checkDateRangeOverlapsApproved,
  formatDate,
  parseLocalDate,
  ApprovedLeaveDateRange,
} from '../utils/date.utils';
import { ValidationErrors } from './auth.validation';

export const validateLeaveApplication = (
  payload: CreateLeavePayload,
  availableBalance: number,
  approvedRanges: ApprovedLeaveDateRange[] = []
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!payload.startDate) {
    errors.startDate = 'Start date is required.';
    return errors;
  }

  if (isSunday(payload.startDate)) {
    errors.startDate = 'Start date cannot be a Sunday. Sundays are non-working days.';
  }

  // End Date is optional: if omitted, defaults to startDate (1-day leave)
  const effectiveEndDate =
    payload.endDate && payload.endDate.trim() ? payload.endDate : payload.startDate;

  if (payload.endDate && isSunday(payload.endDate)) {
    errors.endDate = 'End date cannot be a Sunday. Sundays are non-working days.';
  }

  const start = parseLocalDate(payload.startDate);
  const end = parseLocalDate(effectiveEndDate);

  if (end < start) {
    errors.endDate = 'End date cannot be earlier than start date.';
  } else {
    // 1. Check overlap with existing approved leave applications
    const { overlaps, conflictingRange } = checkDateRangeOverlapsApproved(
      payload.startDate,
      effectiveEndDate,
      approvedRanges
    );

    if (overlaps && conflictingRange) {
      errors.overlap = `Selected dates overlap with an existing approved leave (${formatDate(
        conflictingRange.startDate
      )} to ${formatDate(conflictingRange.endDate)}). Overlapping with approved leaves is not permitted.`;
      errors.endDate = 'Dates overlap with an existing approved leave.';
    } else {
      // 2. Check duration excluding Sundays
      const days = calculateLeaveDays(payload.startDate, effectiveEndDate);
      if (days <= 0) {
        errors.endDate = 'Requested leave contains zero working days (excluding Sundays).';
      } else if (days > availableBalance) {
        errors.endDate = `Requested duration (${days} working day${
          days === 1 ? '' : 's'
        }) exceeds your available balance (${availableBalance} days).`;
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
