'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Track, getStreamUrl } from '@/lib/api';

// Icons defined outside component to prevent hydration mismatch
const PlayIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
    </svg>
);

const PrevIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
);

const NextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

const VolumeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
);

const LoadingIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="loading-icon"
    >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
);

const LyricsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
);

const FullscreenIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
);

interface PlayerProps {
    track: Track | null;
    onNext?: () => void;
    onPrevious?: () => void;
    onTimeUpdate?: (time: number) => void;
    onAudioReady?: (audio: HTMLAudioElement | null) => void;
    onPlayingStateChange?: (isPlaying: boolean) => void;
}

export default function Player({
    track,
    onNext,
    onPrevious,
    onTimeUpdate,
    onAudioReady,
    onPlayingStateChange,
}: PlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Expose audio element to parent
    useEffect(() => {
        if (onAudioReady) {
            onAudioReady(audioRef.current);
        }
    }, [onAudioReady, mounted]);

    const loadTrack = useCallback(async () => {
        if (!track || !audioRef.current) return;

        setIsLoading(true);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        try {
            const streamInfo = await getStreamUrl(track.id);
            if (streamInfo && audioRef.current) {
                audioRef.current.src = streamInfo.url;
                audioRef.current.load();
                await audioRef.current.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Failed to load track:', error);
        } finally {
            setIsLoading(false);
        }
    }, [track]);

    useEffect(() => {
        if (mounted && track) {
            loadTrack();
        }
    }, [mounted, track, loadTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        const newPlayingState = !isPlaying;
        setIsPlaying(newPlayingState);
        if (onPlayingStateChange) {
            onPlayingStateChange(newPlayingState);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setCurrentTime(time);
            if (onTimeUpdate) {
                onTimeUpdate(time);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        setVolume(Math.max(0, Math.min(1, percent)));
    };

    const handleEnded = () => {
        setIsPlaying(false);
        if (onNext) onNext();
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    if (!track) {
        return (
            <div className="player" style={{ opacity: 0.5 }}>
                <div className="player-track">
                    <div className="player-thumbnail" style={{ background: 'var(--bg-active)' }} />
                    <div className="player-info">
                        <div className="player-title" style={{ color: 'var(--text-muted)' }}>
                            No track selected
                        </div>
                        <div className="player-artist">Search for music to start</div>
                    </div>
                </div>
                <div className="player-controls">
                    <div className="controls-buttons">
                        <button className="control-button" disabled><PrevIcon /></button>
                        <button className="control-button play" disabled><PlayIcon /></button>
                        <button className="control-button" disabled><NextIcon /></button>
                    </div>
                    <div className="progress-container">
                        <span className="progress-time">0:00</span>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: 0 }} />
                        </div>
                        <span className="progress-time">0:00</span>
                    </div>
                </div>
                <div className="player-volume">
                    <VolumeIcon />
                    <div className="volume-slider">
                        <div className="volume-fill" style={{ width: '80%' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="player">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onPlay={() => {
                    setIsPlaying(true);
                    if (onPlayingStateChange) onPlayingStateChange(true);
                }}
                onPause={() => {
                    setIsPlaying(false);
                    if (onPlayingStateChange) onPlayingStateChange(false);
                }}
            />

            <div className="player-track">
                <img
                    src={track.thumbnail || '/placeholder.png'}
                    alt=""
                    className="player-thumbnail"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.background = 'var(--bg-active)';
                        (e.target as HTMLImageElement).src = '';
                    }}
                />
                <div className="player-info">
                    <div className="player-title">{track.title}</div>
                    <div className="player-artist">{track.artist}</div>
                </div>
            </div>

            <div className="player-controls">
                <div className="controls-buttons">
                    <button className="control-button" onClick={onPrevious}>
                        <PrevIcon />
                    </button>
                    <button
                        className="control-button play"
                        onClick={togglePlayPause}
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button className="control-button" onClick={onNext}>
                        <NextIcon />
                    </button>
                </div>

                <div className="progress-container">
                    <span className="progress-time">{formatTime(currentTime)}</span>
                    <div className="progress-bar" onClick={handleProgressClick}>
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-time">{formatTime(duration)}</span>
                </div>
            </div>

            <div className="player-volume">
                <VolumeIcon />
                <div className="volume-slider" onClick={handleVolumeClick}>
                    <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
                </div>
            </div>
        </div>
    );
}
