import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { LeaveBalanceSummary } from '../../types/leave.types';

export interface LeaveBalanceCardProps {
  balance?: LeaveBalanceSummary;
  employeeName?: string;
  department?: string;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = React.memo(({
  balance = {
    leaveAllocation: 0,
    usedLeave: 0,
    availableLeave: 0,
    pendingDays: 0,
    pendingRequestsCount: 0,
  },
  employeeName,
  department,
}) => {
  const percentageUsed = useMemo(() => {
    return balance.leaveAllocation > 0
      ? Math.min(100, Math.round((balance.usedLeave / balance.leaveAllocation) * 100))
      : 0;
  }, [balance.leaveAllocation, balance.usedLeave]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-left">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-32 -bottom-20 w-48 h-48 rounded-full bg-indigo-500/10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-700/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium mb-2 border border-indigo-400/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Leave Balance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {employeeName || 'Employee'}
            </h2>
            <p className="text-sm text-indigo-200/80 mt-0.5">
              Department: {department || 'General'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-right">
            <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider block">
              Available Balance
            </span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {balance.availableLeave}
              </span>
              <span className="text-sm text-indigo-200">Days</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-indigo-300 font-medium">Total Allocated</p>
                <p className="text-xl font-bold text-white mt-0.5">
                  {balance.leaveAllocation} <span className="text-xs font-normal text-indigo-300">Days</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-indigo-300 font-medium">Used / Approved</p>
                <p className="text-xl font-bold text-white mt-0.5">
                  {balance.usedLeave} <span className="text-xs font-normal text-indigo-300">Days</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-indigo-300 font-medium">Pending Requests</p>
                <p className="text-xl font-bold text-white mt-0.5">
                  {balance.pendingDays}{' '}
                  <span className="text-xs font-normal text-indigo-300">
                    Days ({balance.pendingRequestsCount})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-indigo-700/30">
          <div className="flex justify-between items-center text-xs text-indigo-200 mb-1.5">
            <span>Allocation Utilization</span>
            <span className="font-semibold">{percentageUsed}% used</span>
          </div>
          <div className="w-full h-2 bg-indigo-950/60 rounded-full overflow-hidden p-0.5 border border-indigo-500/20">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

LeaveBalanceCard.displayName = 'LeaveBalanceCard';

export default LeaveBalanceCard;

