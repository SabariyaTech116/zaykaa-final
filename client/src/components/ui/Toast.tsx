'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {typeof document !== 'undefined' && createPortal(
                <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`
                pointer-events-auto transform transition-all duration-300 ease-out translate-x-0
                flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4 bg-white
                ${toast.type === 'success' ? 'border-green-500' : ''}
                ${toast.type === 'error' ? 'border-red-500' : ''}
                ${toast.type === 'info' ? 'border-blue-500' : ''}
                ${toast.type === 'warning' ? 'border-orange-500' : ''}
              `}
                            role="alert"
                        >
                            <div className={`text-xl
                ${toast.type === 'success' ? 'text-green-500' : ''}
                ${toast.type === 'error' ? 'text-red-500' : ''}
                ${toast.type === 'info' ? 'text-blue-500' : ''}
                ${toast.type === 'warning' ? 'text-orange-500' : ''}
              `}>
                                {toast.type === 'success' && '✓'}
                                {toast.type === 'error' && '✕'}
                                {toast.type === 'info' && 'ℹ'}
                                {toast.type === 'warning' && '⚠'}
                            </div>
                            <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
