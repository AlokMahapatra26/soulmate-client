'use client';

import { useState, useEffect } from 'react';
import { historyAPI } from '@/lib/apiClient';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/lib/api';

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

export default function HistoryPage() {
    const music = useMusic();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);
    const [deleting, setDeleting] = useState<string | null>(null);

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

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await historyAPI.deleteHistoryItem(id);
            setHistory(history.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete history item:', err);
        } finally {
            setDeleting(null);
        }
    };

    const handlePlay = (item: any) => {
        const track: Track = {
            id: item.trackId,
            title: item.title,
            artist: item.artist,
            thumbnail: item.thumbnail,
            thumbnailHD: `https://i.ytimg.com/vi/${item.trackId}/hqdefault.jpg`,
            duration: item.duration || '0:00',
        };
        music.playTrack(track);
    };

    const displayedHistory = history.slice(0, displayCount);
    const hasMore = displayCount < history.length;

    return (
        <div className="content-page">
            <div className="page-header-inline">
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
                <>
                    <div className="list-container">
                        {displayedHistory.map(item => (
                            <div key={item.id} className="list-item">
                                <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="list-item-image clickable"
                                    onClick={() => handlePlay(item)}
                                />
                                <div className="list-item-info" onClick={() => handlePlay(item)} style={{ cursor: 'pointer' }}>
                                    <h3 className="list-item-title">{item.title}</h3>
                                    <p className="list-item-subtitle">{item.artist}</p>
                                </div>
                                <div className="list-item-meta">
                                    <span className="play-count-badge">
                                        {item.playCount} {parseInt(item.playCount) === 1 ? 'play' : 'plays'}
                                    </span>
                                    <span className="text-muted">
                                        {new Date(item.lastPlayedAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="list-item-actions">
                                    <button
                                        className="list-action-btn play-btn"
                                        onClick={() => handlePlay(item)}
                                        title="Play"
                                    >
                                        <PlayIcon />
                                    </button>
                                    <button
                                        className="list-action-btn delete-btn"
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deleting === item.id}
                                        title="Remove from history"
                                    >
                                        {deleting === item.id ? (
                                            <div className="mini-spinner" />
                                        ) : (
                                            <TrashIcon />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="load-more-container">
                            <button
                                className="load-more-btn"
                                onClick={() => setDisplayCount(prev => prev + 10)}
                            >
                                Load More ({history.length - displayCount} remaining)
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
