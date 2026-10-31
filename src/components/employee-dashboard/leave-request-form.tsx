import React, { useState, useId } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import AppButton from '../ui/buttons/app-button';
import AppInput from '../ui/inputs/app-input';
import AppTextarea from '../ui/inputs/app-textarea';
import { useApplyLeave } from '../../hooks/use-leave';
import { validateLeaveApplication } from '../../validation/leave.validation';
import { calculateLeaveDays, getMinStartDate } from '../../utils/date.utils';

export interface LeaveRequestFormProps {
  availableBalance: number;
  onSuccess?: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  availableBalance,
  onSuccess,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const applyLeaveMutation = useApplyLeave();

  const calculatedDays = calculateLeaveDays(startDate, endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    const payload = { startDate, endDate, reason };
    const validationErrors = validateLeaveApplication(payload, availableBalance);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      await applyLeaveMutation.mutateAsync(payload);
      setSuccessMessage('Leave application submitted successfully! It is now pending administrator review.');
      setStartDate('');
      setEndDate('');
      setReason('');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to submit leave application.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Leave Start Date"
          type="date"
          required
          min={getMinStartDate()}
          value={startDate}
          error={errors.startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: '' }));
          }}
          icon={<Calendar className="w-4 h-4" />}
        />

        <AppInput
          label="Leave End Date"
          type="date"
          required
          min={startDate || getMinStartDate()}
          value={endDate}
          error={errors.endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: '' }));
          }}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {/* Live duration calculation callout */}
      {calculatedDays > 0 && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${
            calculatedDays > availableBalance
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="font-medium">Calculated Leave Duration:</span>
          </div>
          <span className="font-bold text-base">
            {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      )}

      <AppTextarea
        label="Reason for Leave"
        required
        rows={3}
        placeholder="Please specify why you are requesting this leave (e.g., medical appointment, family event, personal)..."
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
          disabled={calculatedDays > availableBalance || availableBalance <= 0}
        >
          Submit Application
        </AppButton>
      </div>
    </form>
  );
};

export default LeaveRequestForm;

