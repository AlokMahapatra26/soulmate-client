'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function PendingPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.status === 'approved') {
            router.push('/app');
        }
    }, [user, router]);

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
                        <Clock size={64} strokeWidth={1.5} />
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
