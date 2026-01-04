'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomemakerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'homemaker') {
                // If logged in but not a homemaker, redirect to their appropriate home
                if (user.role === 'admin') router.push('/admin');
                else router.push('/');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta"></div>
            </div>
        );
    }

    // Don't render anything if not authorized (will redirect)
    if (!user || user.role !== 'homemaker') {
        return null;
    }

    return <>{children}</>;
}
