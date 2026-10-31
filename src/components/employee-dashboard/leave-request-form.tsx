import React, { useState } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Clock, Info, ShieldAlert } from 'lucide-react';
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

  const workingDays = calculateLeaveDays(startDate, endDate);
  const sundaysExcluded = countSundaysInRange(startDate, endDate);

  const { overlaps: hasOverlap, conflictingRange } = checkDateRangeOverlapsApproved(
    startDate,
    endDate,
    approvedLeaves
  );

  const handleCalendarRangeSelect = (start: string, end: string) => {
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
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.startDate;
      delete next.overlap;
      return next;
    });
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.endDate;
      delete next.overlap;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    const payload = { startDate, endDate, reason };
    const validationErrors = validateLeaveApplication(payload, availableBalance, approvedLeaves);

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
        }! Awaiting admin review.`
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
  };

  const isInvalidSelection =
    isSunday(startDate) ||
    isSunday(endDate) ||
    hasOverlap ||
    workingDays <= 0 ||
    workingDays > availableBalance;

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
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-800">
            Select Leave Dates on Calendar
          </label>
          <span className="text-xs text-slate-500">
            Click Start date, then click End date
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
              Selected dates overlap with an existing approved leave application (
              {formatDate(conflictingRange?.startDate)} to {formatDate(conflictingRange?.endDate)}
              ). Overlapping with approved leaves is strictly prohibited.
            </p>
          </div>
        </div>
      )}

      {/* Quick Manual Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Leave Start Date"
          type="date"
          required
          min={getMinStartDate()}
          value={startDate}
          error={errors.startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          icon={<Calendar className="w-4 h-4" />}
          helperText={isSunday(startDate) ? 'Sundays cannot be selected' : undefined}
        />

        <AppInput
          label="Leave End Date"
          type="date"
          required
          min={startDate || getMinStartDate()}
          value={endDate}
          error={errors.endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          icon={<Calendar className="w-4 h-4" />}
          helperText={isSunday(endDate) ? 'Sundays cannot be selected' : undefined}
        />
      </div>

      {/* Live duration calculation & Sunday exclusion callout */}
      {startDate && endDate && (
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
              <span className="font-semibold">Calculated Leave Duration:</span>
              <span className="font-bold text-base">
                {workingDays} {workingDays === 1 ? 'Working Day' : 'Working Days'}
              </span>
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
        placeholder="Please specify the reason for your leave (e.g. personal appointment, family function, medical)..."
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
