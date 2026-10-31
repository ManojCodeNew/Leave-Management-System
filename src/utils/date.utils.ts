// Parse date into local midnight to prevent UTC timezone-induced off-by-one errors
export const parseLocalDate = (dateInput?: string | Date): Date => {
  if (!dateInput) return new Date();
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('T')[0].split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    }
  }
  const date = new Date(dateInput);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return '-';
  const date = parseLocalDate(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString?: string | Date): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Check if a given date is Sunday (Day 0)
export const isSunday = (dateInput: string | Date): boolean => {
  const d = parseLocalDate(dateInput);
  return d.getDay() === 0;
};

// Calculate requested working days strictly excluding Sundays
// Saturday is an eligible working day (+1), Sunday is excluded (+0)
// If endDate is omitted, defaults to a single-day leave on startDate
export const calculateLeaveDays = (startDate: string, endDate?: string): number => {
  if (!startDate) return 0;
  const effectiveEnd = endDate && endDate.trim() ? endDate : startDate;
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(effectiveEnd);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    if (current.getDay() !== 0) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
};

// Count how many Sundays fall within the date range
export const countSundaysInRange = (startDate: string, endDate?: string): number => {
  if (!startDate) return 0;
  const effectiveEnd = endDate && endDate.trim() ? endDate : startDate;
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(effectiveEnd);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

  let sundays = 0;
  const current = new Date(start);

  while (current <= end) {
    if (current.getDay() === 0) {
      sundays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return sundays;
};

export interface ApprovedLeaveDateRange {
  startDate: string | Date;
  endDate: string | Date;
}

// Checks if a specific date falls within any existing approved leave date range
export const isDateInApprovedRange = (
  targetDate: string | Date,
  approvedRanges: ApprovedLeaveDateRange[] = []
): boolean => {
  const target = parseLocalDate(targetDate).getTime();

  return approvedRanges.some((range) => {
    const start = parseLocalDate(range.startDate).getTime();
    const end = parseLocalDate(range.endDate).getTime();
    return target >= start && target <= end;
  });
};

// Checks if [start, end] overlaps with any approved leave
export const checkDateRangeOverlapsApproved = (
  startDate: string,
  endDate?: string,
  approvedRanges: ApprovedLeaveDateRange[] = []
): { overlaps: boolean; conflictingRange?: ApprovedLeaveDateRange } => {
  if (!startDate || approvedRanges.length === 0) {
    return { overlaps: false };
  }

  const effectiveEnd = endDate && endDate.trim() ? endDate : startDate;
  const newStart = parseLocalDate(startDate).getTime();
  const newEnd = parseLocalDate(effectiveEnd).getTime();

  for (const range of approvedRanges) {
    const appStart = parseLocalDate(range.startDate).getTime();
    const appEnd = parseLocalDate(range.endDate).getTime();

    // Standard interval overlap condition: newStart <= appEnd && newEnd >= appStart
    if (newStart <= appEnd && newEnd >= appStart) {
      return { overlaps: true, conflictingRange: range };
    }
  }

  return { overlaps: false };
};

export const getMinStartDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toDateInputString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
