import React from 'react';
import { FileText, AlertCircle, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { AdminOverviewStats } from '../../types/admin.types';

export interface LeaveStatisticsProps {
  stats: AdminOverviewStats;
}

export const LeaveStatistics: React.FC<LeaveStatisticsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      {/* Total Requests */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Requests
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRequests}</p>
          <span className="text-xs text-slate-400 mt-0.5 inline-block">All-time applications</span>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingRequests}</p>
          <span className="text-xs text-amber-600/70 mt-0.5 inline-block">Requires decision</span>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Approved Requests */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Approved
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.approvedRequests}</p>
          <span className="text-xs text-emerald-600/70 mt-0.5 inline-block">
            {stats.totalApprovedDays} total days granted
          </span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Rejected Requests */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Rejected
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.rejectedRequests}</p>
          <span className="text-xs text-rose-500/70 mt-0.5 inline-block">Balance untouched</span>
        </div>
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
          <XCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default LeaveStatistics;

