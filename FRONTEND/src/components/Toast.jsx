import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../redux/uiSlice';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3200);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100',
    error: 'border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100',
    info: 'border-brand-500/30 bg-brand-50/90 dark:bg-stone-900/90 text-surface-900 dark:text-surface-100',
    warning: 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100'
  };

  return (
    <div
      role="alert"
      className={`flex items-center space-x-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-xl border ${
        borders[toast.type] || borders.info
      } animate-slideDown max-w-sm pointer-events-auto transition-all`}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 text-xs sm:text-sm font-bold leading-snug">
        {toast.message}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 p-1 rounded-lg transition"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const Toast = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.ui?.toasts || []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-24 right-4 sm:right-6 z-50 flex flex-col space-y-2 pointer-events-none no-print max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => dispatch(removeToast(id))}
        />
      ))}
    </div>
  );
};

export default Toast;
