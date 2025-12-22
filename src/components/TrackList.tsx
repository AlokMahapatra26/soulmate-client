'use client';

import { Track, getDownloadUrl } from '@/lib/api';
import { useState } from 'react';

interface TrackListProps {
    tracks: Track[];
    currentTrack: Track | null;
    onTrackSelect: (track: Track) => void;
}

// Icons defined outside component
const MusicIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export default function TrackList({ tracks, currentTrack, onTrackSelect }: TrackListProps) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownload = async (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();

        // Using a direct link for download as it's more reliable for large files
        // and handles the attachment header correctly.
        const downloadUrl = getDownloadUrl(track);

        // Create a temporary link and click it
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Show a temporary "downloading" state
        setDownloadingId(track.id);
        setTimeout(() => setDownloadingId(null), 3000);
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
                    onClick={() => onTrackSelect(track)}
                >
                    <img
                        src={track.thumbnail || '/placeholder.png'}
                        alt=""
                        className="track-thumbnail"
                        loading="lazy"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.background = 'var(--bg-active)';
                            img.src = '';
                        }}
                    />
                    <div className="track-info">
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist}</div>
                    </div>
                    <div className="track-actions">
                        <div className="track-duration">{track.duration}</div>
                        <button
                            className={`download-btn ${downloadingId === track.id ? 'downloading' : ''}`}
                            onClick={(e) => handleDownload(e, track)}
                            title="Download"
                            disabled={downloadingId !== null}
                        >
                            {downloadingId === track.id ? (
                                <div className="loading-spinner small" />
                            ) : (
                                <DownloadIcon />
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

