import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
} from 'lucide-react';
import {
  parseLocalDate,
  isSunday,
  toDateInputString,
  ApprovedLeaveDateRange,
  formatDate,
} from '../../utils/date.utils';

export interface CalendarPickerProps {
  startDate: string;
  endDate?: string;
  onSelectRange: (startDate: string, endDate: string) => void;
  approvedLeaves?: ApprovedLeaveDateRange[];
  minDate?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CalendarPicker: React.FC<CalendarPickerProps> = React.memo(({
  startDate,
  endDate = '',
  onSelectRange,
  approvedLeaves = [],
  minDate,
}) => {
  const initialDate = useMemo(
    () => (startDate ? parseLocalDate(startDate) : new Date()),
    [startDate]
  );

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const today = useMemo(() => parseLocalDate(new Date()), []);
  const minDateTime = useMemo(
    () => (minDate ? parseLocalDate(minDate).getTime() : today.getTime()),
    [minDate, today]
  );

  // Pre-calculate timestamp boundaries for approved leaves to avoid re-parsing during grid rendering
  const approvedIntervals = useMemo(() => {
    return approvedLeaves.map((range) => ({
      start: parseLocalDate(range.startDate).getTime(),
      end: parseLocalDate(range.endDate).getTime(),
    }));
  }, [approvedLeaves]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Memoize grid cells generation
  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0, Tuesday = 1 ... Sunday = 6
    const startDayOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month trailing cells
    for (let i = startDayOffset - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
      });
    }

    // Current month cells
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month cells to complete grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleGoToday = useCallback(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  const selectedStartTime = useMemo(
    () => (startDate ? parseLocalDate(startDate).getTime() : null),
    [startDate]
  );
  const selectedEndTime = useMemo(
    () => (endDate ? parseLocalDate(endDate).getTime() : null),
    [endDate]
  );

  const isTimestampApproved = useCallback(
    (time: number) => {
      return approvedIntervals.some((iv) => time >= iv.start && time <= iv.end);
    },
    [approvedIntervals]
  );

  const handleDayClick = useCallback(
    (cellDate: Date) => {
      const dateTime = cellDate.getTime();

      // Past dates disabled
      if (dateTime < minDateTime) return;

      // Sundays disabled (non-working)
      if (isSunday(cellDate)) return;

      // Approved leaves disabled
      if (isTimestampApproved(dateTime)) return;

      const dateStr = toDateInputString(cellDate);

      // 1. If no start date or both start & end already chosen:
      // Clicking a date selects it as start date with optional end date (single day)
      if (!startDate || (startDate && endDate)) {
        onSelectRange(dateStr, '');
        return;
      }

      // 2. If start is chosen and user clicked:
      if (startDate && !endDate) {
        if (dateTime === selectedStartTime) {
          // Clicked the same day again -> confirms 1-day leave
          onSelectRange(dateStr, dateStr);
        } else if (dateTime < selectedStartTime!) {
          // Clicked an earlier day -> new start date
          onSelectRange(dateStr, '');
        } else {
          // Clicked a subsequent date -> check if any approved leave exists in-between
          const cur = new Date(parseLocalDate(startDate));
          let hasApprovedOverlap = false;

          while (cur.getTime() <= dateTime) {
            if (isTimestampApproved(cur.getTime())) {
              hasApprovedOverlap = true;
              break;
            }
            cur.setDate(cur.getDate() + 1);
          }

          if (hasApprovedOverlap) {
            // Cannot span across an approved leave; reset to clicked day as new start
            onSelectRange(dateStr, '');
          } else {
            onSelectRange(startDate, dateStr);
          }
        }
      }
    },
    [
      minDateTime,
      isTimestampApproved,
      startDate,
      endDate,
      selectedStartTime,
      onSelectRange,
    ]
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-left select-none">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {MONTH_NAMES[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors mr-1"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels (Monday through Sunday) */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-xs font-semibold text-slate-600 py-1">
            {d}
          </div>
        ))}
        {/* Sunday highlighted as non-working header */}
        <div className="text-xs font-bold text-rose-500 py-1 bg-rose-50/60 rounded">
          Sun
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, idx) => {
          const dateTime = cell.date.getTime();
          const dayNum = cell.date.getDate();
          const sunday = isSunday(cell.date);
          const isPast = dateTime < minDateTime;
          const isApproved = isTimestampApproved(dateTime);

          const isStart = selectedStartTime === dateTime;
          const isEnd = selectedEndTime === dateTime;
          const isSingleDay = isStart && (!selectedEndTime || selectedStartTime === selectedEndTime);
          const isInRange =
            selectedStartTime &&
            selectedEndTime &&
            dateTime > selectedStartTime &&
            dateTime < selectedEndTime;

          const isDisabled = isPast || sunday || isApproved || !cell.isCurrentMonth;

          let cellStyles = 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer';

          if (!cell.isCurrentMonth) {
            cellStyles = 'text-slate-300 cursor-not-allowed bg-slate-50/40';
          } else if (isApproved) {
            cellStyles =
              'bg-emerald-100 text-emerald-800 font-semibold cursor-not-allowed border border-emerald-300 relative';
          } else if (sunday) {
            cellStyles =
              'bg-slate-100 text-slate-400 font-medium cursor-not-allowed border border-dashed border-slate-200';
          } else if (isPast) {
            cellStyles = 'text-slate-300 cursor-not-allowed';
          }

          if (isStart || isEnd || isSingleDay) {
            cellStyles =
              'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 cursor-pointer ring-2 ring-indigo-300';
          } else if (isInRange) {
            cellStyles = 'bg-indigo-100 text-indigo-900 font-semibold cursor-pointer';
          }

          let tooltip = `${formatDate(cell.date)}`;
          if (sunday) tooltip += ' — Sunday (Non-working day)';
          if (isApproved) tooltip += ' — Existing Approved Leave (Unavailable)';

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDayClick(cell.date)}
              title={tooltip}
              className={`
                h-10 sm:h-11 rounded-xl text-xs sm:text-sm flex flex-col items-center justify-center transition-all relative
                ${cellStyles}
              `}
            >
              <span>{dayNum}</span>

              {cell.isCurrentMonth && isApproved && (
                <span className="text-[9px] leading-none text-emerald-700 font-bold tracking-tighter">
                  Approved
                </span>
              )}

              {cell.isCurrentMonth && sunday && (
                <span className="text-[9px] leading-none text-slate-400 font-normal">
                  Off
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend & Selection Guidance */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-white border border-slate-300 inline-block" />
          <span>Eligible Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-100 border border-dashed border-slate-300 inline-block" />
          <span>Sunday (Excluded)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
          <span>Approved Leave</span>
        </div>
      </div>
    </div>
  );
});

CalendarPicker.displayName = 'CalendarPicker';

export default CalendarPicker;
