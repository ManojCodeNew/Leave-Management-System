import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import AppButton from '../ui/buttons/app-button';
import AppInput from '../ui/inputs/app-input';
import AppTextarea from '../ui/inputs/app-textarea';
import CalendarPicker from '../ui/calendar-picker';
import { useApplyLeave } from '../../hooks/use-leave';
import { validateLeaveApplication } from '../../validation/leave.validation';
import {
  calculateLeaveDays,
  countSundaysInRange,
  getMinStartDate,
  isSunday,
  checkDateRangeOverlapsApproved,
  ApprovedLeaveDateRange,
  formatDate,
} from '../../utils/date.utils';

export interface LeaveRequestFormProps {
  availableBalance: number;
  approvedLeaves?: ApprovedLeaveDateRange[];
  onSuccess?: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  availableBalance,
  approvedLeaves = [],
  onSuccess,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const applyLeaveMutation = useApplyLeave();

  // If endDate is omitted, treat it as a 1-day leave on startDate
  const effectiveEndDate = useMemo(
    () => (endDate && endDate.trim() ? endDate : startDate),
    [startDate, endDate]
  );

  const isSingleDay = useMemo(
    () => !endDate || endDate === startDate,
    [startDate, endDate]
  );

  const workingDays = useMemo(
    () => calculateLeaveDays(startDate, effectiveEndDate),
    [startDate, effectiveEndDate]
  );

  const sundaysExcluded = useMemo(
    () => countSundaysInRange(startDate, effectiveEndDate),
    [startDate, effectiveEndDate]
  );

  const { overlaps: hasOverlap, conflictingRange } = useMemo(
    () => checkDateRangeOverlapsApproved(startDate, effectiveEndDate, approvedLeaves),
    [startDate, effectiveEndDate, approvedLeaves]
  );

  const handleCalendarRangeSelect = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.startDate;
      delete next.endDate;
      delete next.overlap;
      delete next.form;
      return next;
    });
  }, []);

  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.startDate;
      delete next.overlap;
      return next;
    });
  }, []);

  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.endDate;
      delete next.overlap;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSuccessMessage(null);

      const payload = {
        startDate,
        endDate: endDate || startDate, // Optional end date defaults to start date
        reason,
      };

      const validationErrors = validateLeaveApplication(
        payload,
        availableBalance,
        approvedLeaves
      );

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});

      try {
        await applyLeaveMutation.mutateAsync(payload);
        setSuccessMessage(
          `Leave application submitted successfully for ${workingDays} working day(s)${
            sundaysExcluded > 0 ? ` (${sundaysExcluded} Sunday excluded)` : ''
          }! It is now pending admin review.`
        );
        setStartDate('');
        setEndDate('');
        setReason('');
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1600);
        }
      } catch (err: any) {
        setErrors({ form: err.message || 'Failed to submit leave application.' });
      }
    },
    [
      startDate,
      endDate,
      reason,
      availableBalance,
      approvedLeaves,
      applyLeaveMutation,
      workingDays,
      sundaysExcluded,
      onSuccess,
    ]
  );

  const isInvalidSelection = useMemo(() => {
    return (
      !startDate ||
      isSunday(startDate) ||
      (endDate && isSunday(endDate)) ||
      hasOverlap ||
      workingDays <= 0 ||
      workingDays > availableBalance
    );
  }, [startDate, endDate, hasOverlap, workingDays, availableBalance]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errors.form && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Calendar Interactive Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <label className="block text-sm font-semibold text-slate-800">
            Select Leave Dates
          </label>
          <span className="text-xs text-slate-500">
            Click 1 date for a 1-day leave, or pick a range
          </span>
        </div>

        <CalendarPicker
          startDate={startDate}
          endDate={endDate}
          onSelectRange={handleCalendarRangeSelect}
          approvedLeaves={approvedLeaves}
          minDate={getMinStartDate()}
        />
      </div>

      {/* Overlap Error Alert */}
      {(errors.overlap || (hasOverlap && conflictingRange)) && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Date Overlap Detected:</p>
            <p>
              Selected date(s) overlap with an existing approved leave application (
              {formatDate(conflictingRange?.startDate)} to {formatDate(conflictingRange?.endDate)}
              ). Overlapping with approved leaves is strictly prohibited.
            </p>
          </div>
        </div>
      )}

      {/* Date Inputs (Start Date required, End Date optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Leave Start Date"
          type="date"
          required
          min={getMinStartDate()}
          value={startDate}
          error={errors.startDate}
          onChange={handleStartDateChange}
          icon={<Calendar className="w-4 h-4" />}
          helperText={isSunday(startDate) ? 'Sundays cannot be selected' : undefined}
        />

        <AppInput
          label="Leave End Date (Optional)"
          type="date"
          min={startDate || getMinStartDate()}
          value={endDate}
          error={errors.endDate}
          onChange={handleEndDateChange}
          icon={<Calendar className="w-4 h-4" />}
          helperText={
            endDate
              ? isSunday(endDate)
                ? 'Sundays cannot be selected'
                : undefined
              : 'Leave empty for a 1-day leave on the start date.'
          }
        />
      </div>

      {/* Live duration calculation & Sunday exclusion callout */}
      {startDate && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
            isInvalidSelection
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold">Calculated Duration:</span>
              <span className="font-bold text-base">
                {workingDays} {workingDays === 1 ? 'Working Day' : 'Working Days'}
              </span>
              {isSingleDay && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-medium">
                  Single Day
                </span>
              )}
            </div>
            {sundaysExcluded > 0 && (
              <p className="text-xs text-indigo-700/80 pl-6">
                * Note: {sundaysExcluded} Sunday excluded (non-working day, 0 days deducted).
              </p>
            )}
          </div>

          <div className="text-right sm:border-l sm:border-indigo-200 sm:pl-4">
            <span className="text-xs font-medium text-slate-500 block">Available Quota</span>
            <span className="font-bold text-sm text-slate-800">
              {availableBalance} Days
            </span>
          </div>
        </div>
      )}

      <AppTextarea
        label="Reason for Leave"
        required
        rows={3}
        placeholder="Please specify why you are requesting this leave (e.g., family function, personal work, medical)..."
        value={reason}
        error={errors.reason}
        onChange={(e) => {
          setReason(e.target.value);
          if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
        }}
        helperText="Between 5 and 500 characters."
      />

      <div className="pt-2 flex justify-end gap-3">
        <AppButton
          type="submit"
          variant="primary"
          isLoading={applyLeaveMutation.isPending}
          disabled={isInvalidSelection || availableBalance <= 0}
        >
          Submit Application
        </AppButton>
      </div>
    </form>
  );
};

export default LeaveRequestForm;
