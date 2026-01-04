'use client';

import { ReactNode } from 'react';
import { AuthProvider, CartProvider } from '@/contexts';

import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </CartProvider>
        </AuthProvider>
    );
}
