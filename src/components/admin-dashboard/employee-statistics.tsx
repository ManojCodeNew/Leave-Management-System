import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, ArrowRight } from 'lucide-react';
import AppButton from '../ui/buttons/app-button';

export interface EmployeeStatisticsProps {
  totalEmployees: number;
}

export const EmployeeStatistics: React.FC<EmployeeStatisticsProps> = ({ totalEmployees }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
      <div className="flex items-center gap-4">
        <div className="p-3.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
            Organization Workforce
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-3xl font-extrabold text-white">{totalEmployees}</h3>
            <span className="text-sm text-slate-300 font-medium">Registered Employees</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active staff members managed under the leave policy.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <AppButton
          variant="secondary"
          size="small"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={() => navigate('/admin/employees')}
        >
          View All Employees
        </AppButton>
      </div>
    </div>
  );
};

export default EmployeeStatistics;

