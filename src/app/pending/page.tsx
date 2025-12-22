'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.status === 'approved') {
            router.push('/app');
        }
    }, [user, router]);

    const ClockIcon = () => (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-header">
                    <h1 className="auth-logo">
                        SOUL<span className="logo-accent">MATE</span>
                    </h1>
                </div>

                {/* Pending Status */}
                <div className="pending-content">
                    <div className="pending-icon">
                        <ClockIcon />
                    </div>

                    <h2 className="pending-title">Account Pending Approval</h2>

                    <p className="pending-message">
                        Thank you for registering! Your account is currently awaiting administrator approval.
                    </p>

                    <p className="pending-message">
                        You'll receive access once an admin reviews and approves your registration.
                        Please check back later.
                    </p>

                    {user && (
                        <div className="pending-info">
                            <p><strong>Registered as:</strong> {user.email}</p>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Status:</strong> <span className="status-badge status-pending">Pending</span></p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pending-actions">
                    <button
                        onClick={logout}
                        className="auth-button secondary"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Footer */}
                <div className="auth-footer">
                    <Link href="/landing" className="back-link">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
