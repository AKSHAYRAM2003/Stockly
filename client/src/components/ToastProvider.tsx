'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, title, description };
    setToasts((prev) => [...prev, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-right-2 ${
              toast.type === 'success'
                ? 'bg-green-900 border-green-700 text-green-100'
                : toast.type === 'error'
                ? 'bg-red-900 border-red-700 text-red-100'
                : 'bg-blue-900 border-blue-700 text-blue-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <ToastPrimitive.Title className="font-semibold text-sm">
                  {toast.title}
                </ToastPrimitive.Title>
                {toast.description && (
                  <ToastPrimitive.Description className="text-sm mt-1 opacity-90">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close
                onClick={() => removeToast(toast.id)}
                className="ml-4 p-1 rounded hover:bg-black/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </ToastPrimitive.Close>
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
