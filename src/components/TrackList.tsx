'use client';

import { Track, getDownloadUrl } from '@/lib/api';
import { useState } from 'react';

interface TrackListProps {
    tracks: Track[];
    currentTrack: Track | null;
    onTrackSelect: (track: Track) => void;
    onAddToQueue: (track: Track) => void;
}

// Icons
const MusicIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

const ThreeDotsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);

const AddToQueueIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export default function TrackList({ tracks, currentTrack, onTrackSelect, onAddToQueue }: TrackListProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleDownload = (track: Track) => {
        const downloadUrl = getDownloadUrl(track);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setOpenMenuId(null);
    };

    const toggleMenu = (e: React.MouseEvent, trackId: string) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === trackId ? null : trackId);
    };

    if (tracks.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">
                    <MusicIcon />
                </div>
                <p className="empty-text">Search for your favorite music</p>
            </div>
        );
    }

    return (
        <div className="track-list">
            {tracks.map((track) => (
                <div
                    key={track.id}
                    className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                >
                    <img
                        src={track.thumbnail || '/placeholder.png'}
                        alt=""
                        className="track-thumbnail"
                        loading="lazy"
                        onClick={() => onTrackSelect(track)}
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.background = 'var(--black-80)';
                            img.src = '';
                        }}
                    />
                    <div className="track-info" onClick={() => onTrackSelect(track)}>
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist}</div>
                    </div>
                    <div className="track-actions">
                        <div className="track-duration">{track.duration}</div>
                        <div className="track-menu-container">
                            <button
                                className="track-action-btn"
                                onClick={(e) => toggleMenu(e, track.id)}
                                title="More options"
                            >
                                <ThreeDotsIcon />
                            </button>

                            {openMenuId === track.id && (
                                <>
                                    <div
                                        className="track-menu-backdrop"
                                        onClick={() => setOpenMenuId(null)}
                                    />
                                    <div className="track-menu">
                                        <button
                                            className="track-menu-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToQueue(track);
                                                setOpenMenuId(null);
                                            }}
                                        >
                                            <AddToQueueIcon />
                                            <span>Add to Queue</span>
                                        </button>
                                        <button
                                            className="track-menu-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(track);
                                            }}
                                        >
                                            <DownloadIcon />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
