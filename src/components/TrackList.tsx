'use client';

import { Track } from '@/lib/api';

interface TrackListProps {
    tracks: Track[];
    currentTrack: Track | null;
    onTrackSelect: (track: Track) => void;
}

// Icon defined outside component
const MusicIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

export default function TrackList({ tracks, currentTrack, onTrackSelect }: TrackListProps) {
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
                    <div className="track-duration">{track.duration}</div>
                </div>
            ))}
        </div>
    );
}
