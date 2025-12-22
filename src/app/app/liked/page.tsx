'use client';

import { useState, useEffect } from 'react';
import { likesAPI } from '@/lib/apiClient';
import Link from 'next/link';

export default function LikedPage() {
    const [likedSongs, setLikedSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLikedSongs();
    }, []);

    const fetchLikedSongs = async () => {
        try {
            const response = await likesAPI.getLikedSongs();
            setLikedSongs(response.data);
        } catch (err) {
            console.error('Failed to fetch liked songs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlike = async (trackId: string) => {
        try {
            await likesAPI.unlikeSong(trackId);
            setLikedSongs(likedSongs.filter(song => song.trackId !== trackId));
        } catch (err) {
            console.error('Failed to unlike song:', err);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Liked Songs</h1>
                    <p className="page-subtitle">{likedSongs.length} songs</p>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : likedSongs.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-text">No liked songs yet. Start listening and like your favorites!</p>
                </div>
            ) : (
                <div className="list-container">
                    {likedSongs.map(song => (
                        <div key={song.id} className="list-item">
                            <img src={song.thumbnail} alt={song.title} className="list-item-image" />
                            <div className="list-item-info">
                                <h3 className="list-item-title">{song.title}</h3>
                                <p className="list-item-subtitle">{song.artist}</p>
                            </div>
                            <div className="list-item-meta">
                                <span className="text-muted">{song.duration}</span>
                                <button onClick={() => handleUnlike(song.trackId)} className="btn-icon-danger" title="Unlike">
                                    ♥
                                </button>
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
