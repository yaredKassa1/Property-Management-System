'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colors: Record<ToastType, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
  warning: 'bg-yellow-500',
};

export function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl text-white max-w-sm animate-fade-in-down ${colors[type]}`}
      role="alert"
    >
      <span className="text-xl mt-0.5">{icons[type]}</span>
      <div className="flex-1 text-sm leading-snug">{message}</div>
      <button
        onClick={onClose}
        className="ml-2 text-white/70 hover:text-white text-lg leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
