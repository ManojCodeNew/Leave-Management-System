import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import IconButton from '../buttons/icon-button';

export interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = '2xl',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses: Record<string, string> = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        {/* Slide-over Drawer Panel */}
        <div
          ref={drawerRef}
          className={`w-full ${widthClasses[maxWidth] || 'max-w-2xl'} bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 translate-x-0 border-l border-slate-200 text-left`}
        >
          {/* Drawer Sticky Header */}
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            <IconButton
              icon={<X className="w-5 h-5 text-slate-500 hover:text-slate-800" />}
              onClick={onClose}
              aria-label="Close drawer"
            />
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDrawer;

