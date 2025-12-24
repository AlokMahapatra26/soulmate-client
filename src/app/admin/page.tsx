'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, supportersAPI } from '@/lib/apiClient';
import { Users, UserCheck, UserX, Trash2, Star, Plus } from 'lucide-react';

interface User {
    id: string;
    email: string;
    name: string;
    status: string;
    role: string;
    createdAt: string;
}


interface Supporter {
    id: string;
    name: string;
    amount: string | null;
    message: string | null;
}

type TabType = 'pending' | 'users' | 'supporters';

export default function AdminPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');



    // Add supporter form
    const [showAddSupporter, setShowAddSupporter] = useState(false);
    const [newSupporter, setNewSupporter] = useState({ name: '', amount: '', message: '' });

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/app');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user?.role === 'admin') {
            loadData();
        }
    }, [user, activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'pending') {
                const response = await usersAPI.getPending();
                setPendingUsers(response.data);
            } else if (activeTab === 'users') {
                const response = await usersAPI.getAllUsers();
                setAllUsers(response.data);
            } else if (activeTab === 'supporters') {
                const response = await supportersAPI.getSupporters();
                setSupporters(response.data);
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            await usersAPI.approveUser(userId);
            setPendingUsers(pendingUsers.filter(u => u.id !== userId));
            loadData();
        } catch (err) {
            setError('Failed to approve user');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await usersAPI.rejectUser(userId);
            setPendingUsers(pendingUsers.filter(u => u.id !== userId));
            loadData();
        } catch (err) {
            setError('Failed to reject user');
        }
    };

    const handleRevoke = async (userId: string) => {
        if (!confirm('Are you sure you want to revoke this user\'s approval?')) return;
        try {
            await usersAPI.revokeUser(userId);
            loadData();
        } catch (err) {
            setError('Failed to revoke user');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to DELETE this user? This cannot be undone!')) return;
        try {
            await usersAPI.deleteUser(userId);
            setAllUsers(allUsers.filter(u => u.id !== userId));
        } catch (err) {
            setError('Failed to delete user');
        }
    };



    const handleAddSupporter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSupporter.name.trim()) return;
        try {
            await supportersAPI.addSupporter({
                name: newSupporter.name.trim(),
                amount: newSupporter.amount.trim() || undefined,
                message: newSupporter.message.trim() || undefined,
            });
            setNewSupporter({ name: '', amount: '', message: '' });
            setShowAddSupporter(false);
            loadData();
        } catch (err) {
            setError('Failed to add supporter');
        }
    };

    const handleDeleteSupporter = async (id: string) => {
        if (!confirm('Delete this supporter?')) return;
        try {
            await supportersAPI.deleteSupporter(id);
            setSupporters(supporters.filter(s => s.id !== id));
        } catch (err) {
            setError('Failed to delete supporter');
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
                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <UserCheck size={18} />
                        Pending ({pendingUsers.length})
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} />
                        All Users
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'supporters' ? 'active' : ''}`}
                        onClick={() => setActiveTab('supporters')}
                    >
                        <Star size={18} />
                        Supporters
                    </button>
                </div>

                {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

                {/* Pending Users Tab */}
                {activeTab === 'pending' && (
                    pendingUsers.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-text">No pending user approvals</p>
                        </div>
                    ) : (
                        <div className="admin-list">
                            {pendingUsers.map(u => (
                                <div key={u.id} className="admin-card">
                                    <div className="admin-card-info">
                                        <h3>{u.name}</h3>
                                        <p>{u.email}</p>
                                        <span className="admin-card-date">
                                            Registered: {new Date(u.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="admin-card-actions">
                                        <button onClick={() => handleApprove(u.id)} className="admin-button approve">
                                            Approve
                                        </button>
                                        <button onClick={() => handleReject(u.id)} className="admin-button reject">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* All Users Tab */}
                {activeTab === 'users' && (
                    <div className="admin-list">
                        {allUsers.map(u => (
                            <div key={u.id} className="admin-card">
                                <div className="admin-card-info">
                                    <h3>{u.name} {u.role === 'admin' && <span className="badge admin-badge">Admin</span>}</h3>
                                    <p>{u.email}</p>
                                    <span className={`badge status-${u.status}`}>{u.status}</span>
                                </div>
                                <div className="admin-card-actions">
                                    {u.status === 'approved' && u.role !== 'admin' && (
                                        <button onClick={() => handleRevoke(u.id)} className="admin-button revoke" title="Revoke Approval">
                                            <UserX size={16} />
                                        </button>
                                    )}
                                    {u.role !== 'admin' && (
                                        <button onClick={() => handleDelete(u.id)} className="admin-button delete" title="Delete User">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Supporters Tab */}
                {activeTab === 'supporters' && (
                    <div>
                        <button
                            className="admin-button approve"
                            style={{ marginBottom: '16px' }}
                            onClick={() => setShowAddSupporter(!showAddSupporter)}
                        >
                            <Plus size={16} />
                            Add Supporter
                        </button>

                        {showAddSupporter && (
                            <form className="add-supporter-form" onSubmit={handleAddSupporter}>
                                <input
                                    type="text"
                                    placeholder="Supporter name *"
                                    value={newSupporter.name}
                                    onChange={(e) => setNewSupporter({ ...newSupporter, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Amount (optional)"
                                    value={newSupporter.amount}
                                    onChange={(e) => setNewSupporter({ ...newSupporter, amount: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Message (optional)"
                                    value={newSupporter.message}
                                    onChange={(e) => setNewSupporter({ ...newSupporter, message: e.target.value })}
                                />
                                <button type="submit" className="admin-button approve">Save</button>
                            </form>
                        )}

                        {supporters.length === 0 ? (
                            <div className="empty-state">
                                <p className="empty-text">No supporters added yet</p>
                            </div>
                        ) : (
                            <div className="admin-list">
                                {supporters.map(s => (
                                    <div key={s.id} className="admin-card supporter-card">
                                        <div className="admin-card-info">
                                            <h3><Star size={14} className="star-icon" /> {s.name}</h3>
                                            {s.amount && <p className="supporter-amount">{s.amount}</p>}
                                            {s.message && <p className="supporter-message">{s.message}</p>}
                                        </div>
                                        <button onClick={() => handleDeleteSupporter(s.id)} className="admin-button delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>


            <style jsx>{`
                .admin-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .admin-tab {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: var(--white-5);
                    border: 1px solid var(--white-10);
                    border-radius: 8px;
                    color: var(--white-60);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .admin-tab:hover {
                    background: var(--white-10);
                }

                .admin-tab.active {
                    background: var(--red-dim, rgba(255, 0, 80, 0.1));
                    border-color: var(--red);
                    color: var(--red);
                }

                .admin-button {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .admin-button.revoke {
                    background: #f59e0b20;
                    color: #f59e0b;
                }

                .admin-button.delete {
                    background: #ef444420;
                    color: #ef4444;
                }

                .admin-button.approve {
                    background: #22c55e20;
                    color: #22c55e;
                }

                .admin-button.reject {
                    background: #ef444420;
                    color: #ef4444;
                }

                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .admin-badge {
                    background: var(--red-dim);
                    color: var(--red);
                    margin-left: 8px;
                }

                .status-approved {
                    background: #22c55e20;
                    color: #22c55e;
                }

                .status-pending {
                    background: #f59e0b20;
                    color: #f59e0b;
                }

                .status-rejected {
                    background: #ef444420;
                    color: #ef4444;
                }

                .add-supporter-form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 16px;
                    background: var(--white-5);
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .add-supporter-form input {
                    padding: 10px 12px;
                    background: var(--black-90);
                    border: 1px solid var(--white-10);
                    border-radius: 6px;
                    color: var(--white);
                    font-size: 14px;
                }

                .supporter-card {
                    border-color: #ffd7002a;
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), transparent);
                }

                .star-icon {
                    color: #ffd700;
                }

                .supporter-amount {
                    color: #ffd700;
                    font-weight: 600;
                }

                .supporter-message {
                    color: var(--white-60);
                    font-size: 13px;
                }


            `}</style>
        </div>
    );
}
