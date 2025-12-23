'use client';

import { useState, useEffect } from 'react';
import { useMusic } from '@/contexts/MusicContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VideoPlayer() {
    const { currentTrack, showVideo, setShowVideo } = useMusic();
    const [musicVideoId, setMusicVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    // Fetch music video ID when track changes
    useEffect(() => {
        if (!showVideo || !currentTrack) {
            setMusicVideoId(null);
            return;
        }

        const fetchMusicVideoId = async () => {
            setIsLoading(true);
            setError(false);

            try {
                const params = new URLSearchParams({
                    title: currentTrack.title,
                    artist: currentTrack.artist,
                });

                const response = await fetch(`${API_BASE}/api/music/video-id?${params}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch video ID');
                }

                const data = await response.json();
                setMusicVideoId(data.videoId);
            } catch (err) {
                console.error('Error fetching music video ID:', err);
                setError(true);
                // Fallback to track ID if video lookup fails
                setMusicVideoId(currentTrack.id);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMusicVideoId();
    }, [currentTrack, showVideo]);

    if (!showVideo || !currentTrack) {
        return null;
    }

    const CloseIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );

    return (
        <div className="video-player-container">
            <div className="video-player-header">
                <h3>Now Playing</h3>
                <button
                    className="video-close-button"
                    onClick={() => setShowVideo(false)}
                    title="Close Video"
                >
                    <CloseIcon />
                </button>
            </div>
            <div className="video-player-wrapper">
                {isLoading ? (
                    <div className="video-loading">
                        <div className="loading-spinner" />
                        <p>Finding music video...</p>
                    </div>
                ) : error ? (
                    <div className="video-error">
                        <p>Could not find music video</p>
                        <p style={{ fontSize: '12px', opacity: 0.6 }}>Playing audio only</p>
                    </div>
                ) : musicVideoId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${musicVideoId}?autoplay=1&rel=0&modestbranding=1`}
                        title={currentTrack.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="video-player-iframe"
                    />
                ) : null}
            </div>
            <div className="video-player-info">
                <p className="video-title">{currentTrack.title}</p>
                <p className="video-artist">{currentTrack.artist}</p>
            </div>
        </div>
    );
}
