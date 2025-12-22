'use client';

import { useState, useEffect } from 'react';
import { historyAPI } from '@/lib/apiClient';
import Link from 'next/link';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await historyAPI.getHistory(100);
            setHistory(response.data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Listening History</h1>
                    <p className="page-subtitle">Your recently played tracks</p>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : history.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-text">No listening history yet. Start playing some music!</p>
                </div>
            ) : (
                <div className="list-container">
                    {history.map(item => (
                        <div key={item.id} className="list-item">
                            <img src={item.thumbnail} alt={item.title} className="list-item-image" />
                            <div className="list-item-info">
                                <h3 className="list-item-title">{item.title}</h3>
                                <p className="list-item-subtitle">{item.artist}</p>
                            </div>
                            <div className="list-item-meta">
                                <span className="text-muted">
                                    {new Date(item.playedAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="page-nav">
                <Link href="/app" className="back-link">← Back to Player</Link>
            </div>
        </div>
    );
}
