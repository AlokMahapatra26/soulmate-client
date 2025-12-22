'use client';

import { useState, useEffect } from 'react';
import { likesAPI } from '@/lib/apiClient';
import { useMusic } from '@/contexts/MusicContext';
import { Trash2 } from 'lucide-react';

export default function LikedPage() {
    const music = useMusic();
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

    const handleUnlike = async (trackId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await likesAPI.unlikeSong(trackId);
            setLikedSongs(likedSongs.filter(song => song.trackId !== trackId));
        } catch (err) {
            console.error('Failed to unlike song:', err);
        }
    };

    const handlePlayTrack = (song: any) => {
        const track = {
            id: song.trackId,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail,
            duration: song.duration,
        };
        music.playTrack(track);
    };

    return (
        <div className="content-page">
            <div className="page-header-inline">
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
                        <div
                            key={song.id}
                            className={`list-item clickable ${music.currentTrack?.id === song.trackId ? 'playing' : ''}`}
                            onClick={() => handlePlayTrack(song)}
                        >
                            <img src={song.thumbnail} alt={song.title} className="list-item-image" />
                            <div className="list-item-info">
                                <h3 className="list-item-title">{song.title}</h3>
                                <p className="list-item-subtitle">{song.artist}</p>
                            </div>
                            <div className="list-item-meta">
                                <span className="text-muted">{song.duration}</span>
                                <button
                                    onClick={(e) => handleUnlike(song.trackId, e)}
                                    className="btn-icon-danger"
                                    title="Unlike"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
