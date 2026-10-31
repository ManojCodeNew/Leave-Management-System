import React from 'react';
import { FileQuestion } from 'lucide-react';
import AppButton from './buttons/app-button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
        {icon || <FileQuestion className="w-8 h-8" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <AppButton size="small" onClick={onAction}>
          {actionLabel}
        </AppButton>
      )}
    </div>
  );
};

export default EmptyState;

