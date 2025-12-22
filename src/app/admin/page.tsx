'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/apiClient';

interface PendingUser {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export default function AdminPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/app');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchPendingUsers();
        }
    }, [user]);

    const fetchPendingUsers = async () => {
        try {
            const response = await usersAPI.getPending();
            setPendingUsers(response.data);
        } catch (err) {
            setError('Failed to load pending users');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            await usersAPI.approveUser(userId);
            setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        } catch (err) {
            setError('Failed to approve user');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await usersAPI.rejectUser(userId);
            setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        } catch (err) {
            setError('Failed to reject user');
        }
    };

    if (isLoading || loading) {
        return <div className="loading-container"><div className="loading-spinner" /></div>;
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="admin-container">
            <nav className="navbar">
                <h1 className="navbar-logo">
                    SOUL<span className="navbar-logo-accent">MATE</span> Admin
                </h1>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    <button onClick={() => router.push('/app')} className="nav-button">
                        Back to App
                    </button>
                    <button onClick={logout} className="nav-button secondary">
                        Sign Out
                    </button>
                </div>
            </nav>

            <div className="admin-content">
                <div className="admin-header">
                    <h2>Pending User Approvals</h2>
                    <p>Review and approve new user registrations</p>
                </div>

                {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

                {pendingUsers.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-text">No pending user approvals</p>
                    </div>
                ) : (
                    <div className="admin-list">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="admin-card">
                                <div className="admin-card-info">
                                    <h3>{user.name}</h3>
                                    <p>{user.email}</p>
                                    <span className="admin-card-date">
                                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="admin-card-actions">
                                    <button
                                        onClick={() => handleApprove(user.id)}
                                        className="admin-button approve"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(user.id)}
                                        className="admin-button reject"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
