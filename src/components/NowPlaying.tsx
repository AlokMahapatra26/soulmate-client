'use client';

import { Track } from '@/lib/api';

interface NowPlayingProps {
    track: Track | null;
    queue: Track[];
    onQueueItemClick: (track: Track) => void;
    onQueueItemRemove: (trackId: string) => void;
}

export default function NowPlaying({ track, queue, onQueueItemClick, onQueueItemRemove }: NowPlayingProps) {
    const RemoveIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );

    return (
        <>
            {/* Now Playing Section */}
            {track ? (
                <div className="now-playing">
                    <div className="now-playing-artwork">
                        <img
                            src={track.thumbnailHD || track.thumbnail}
                            alt={track.title}
                            className="now-playing-image"
                        />
                    </div>

                    <div className="now-playing-info">
                        <h2 className="now-playing-title">{track.title}</h2>
                        <p className="now-playing-artist">{track.artist}</p>
                    </div>
                </div>
            ) : (
                <div className="now-playing">
                    <div className="now-playing-artwork" />
                    <div className="now-playing-info">
                        <h2 className="now-playing-title" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            No track playing
                        </h2>
                        <p className="now-playing-artist">Search for music to start</p>
                    </div>
                </div>
            )}

            {/* Queue Section */}
            <div className="queue-panel">
                <div className="queue-header">
                    <h3>Queue ({queue.length})</h3>
                </div>

                <div className="queue-list">
                    {queue.length === 0 ? (
                        <div className="queue-empty">
                            <span>Queue is empty</span>
                            <span style={{ fontSize: '11px', opacity: 0.6 }}>
                                Add tracks to play next
                            </span>
                        </div>
                    ) : (
                        queue.map((queueTrack, index) => (
                            <div
                                key={`${queueTrack.id}-${index}`}
                                className={`queue-item ${queueTrack.id === track?.id ? 'active' : ''}`}
                                onClick={() => onQueueItemClick(queueTrack)}
                            >
                                <img
                                    src={queueTrack.thumbnail}
                                    alt={queueTrack.title}
                                    className="queue-item-thumbnail"
                                />
                                <div className="queue-item-info">
                                    <div className="queue-item-title">{queueTrack.title}</div>
                                    <div className="queue-item-artist">{queueTrack.artist}</div>
                                </div>
                                <button
                                    className="queue-item-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onQueueItemRemove(queueTrack.id);
                                    }}
                                    title="Remove from queue"
                                >
                                    <RemoveIcon />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
