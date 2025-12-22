'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push('/landing');
        } else if (user?.status === 'pending') {
            router.push('/pending');
        } else if (user?.status === 'approved') {
            router.push('/app');
        }
    }, [isAuthenticated, user, isLoading, router]);

    return (
        <div className="loading-container">
            <div className="loading-spinner" />
        </div>
    );
}
