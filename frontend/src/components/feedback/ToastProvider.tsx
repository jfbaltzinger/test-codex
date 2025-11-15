import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

type ToastStatus = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  status: ToastStatus;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const iconByStatus: Record<ToastStatus, React.ReactNode> = {
  success: <CheckCircleIcon className="h-5 w-5 text-emerald-500" />,
  error: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
  info: <InformationCircleIcon className="h-5 w-5 text-primary-500" />,
};

const statusClasses: Record<ToastStatus, string> = {
  success: 'border-emerald-400 bg-emerald-50 text-emerald-900',
  error: 'border-red-400 bg-red-50 text-red-900',
  info: 'border-primary-400 bg-primary-50 text-primary-900',
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const createToast = (status: ToastStatus, message: string): Toast => ({
  id: generateId(),
  message,
  status,
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((status: ToastStatus, message: string) => {
    const toast = createToast(status, message);
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 3500);
  }, []);

  const value = useMemo(
    () => ({
      success: (message: string) => addToast('success', message),
      error: (message: string) => addToast('error', message),
      info: (message: string) => addToast('info', message),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center space-y-2 px-4">
        {toasts.map((toast) => (
          <Transition
            key={toast.id}
            show
            appear
            enter="transform ease-out duration-200"
            enterFrom="-translate-y-2 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className={clsx(
              'pointer-events-auto flex w-full max-w-md items-center space-x-2 rounded-lg border px-4 py-3 shadow-lg',
              statusClasses[toast.status]
            )}
          >
            {iconByStatus[toast.status]}
            <span className="text-sm font-medium">{toast.message}</span>
          </Transition>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans un ToastProvider');
  }
  return context;
};
