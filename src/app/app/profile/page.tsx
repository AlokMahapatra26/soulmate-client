'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="content-page">
            <div className="page-header-inline">
                <h1 className="page-title">Profile</h1>
            </div>

            <div className="profile-card-inline">
                <div className="profile-avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="profile-info">
                    <h2 className="profile-name">{user.name}</h2>
                    <p className="profile-email">{user.email}</p>
                    <div className="profile-badges">
                        <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                            {user.role}
                        </span>
                        <span className="badge badge-approved">{user.status}</span>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-label">Member Since</span>
                        <span className="stat-value">
                            {new Date(user.createdAt!).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="profile-actions">
                    <button
                        onClick={() => {
                            logout();
                            router.push('/landing');
                        }}
                        className="btn-danger"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
