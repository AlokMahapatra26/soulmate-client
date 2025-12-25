'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Track, getStreamUrl, getDownloadUrl, getVideoDetails, VideoDetails } from '@/lib/api';
import { useMusic } from '@/contexts/MusicContext';
import { likesAPI, playlistsAPI, historyAPI } from '@/lib/apiClient';
import {
    Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw
} from 'lucide-react';

// Icons defined outside component to prevent hydration mismatch
// Icons defined using Lucide for softer look
// Icons defined using Lucide for softer look (Main Controls)
const PlayIcon = () => <Play fill="currentColor" stroke="currentColor" strokeWidth={3} />;
const PauseIcon = () => <Pause fill="currentColor" stroke="currentColor" strokeWidth={3} />;
const PrevIcon = () => <SkipBack strokeWidth={2.5} />;
const NextIcon = () => <SkipForward strokeWidth={2.5} />;
const Rewind10Icon = () => <RotateCcw strokeWidth={2.5} />;
const Forward10Icon = () => <RotateCw strokeWidth={2.5} />;

// Original Icons for Extras
const VolumeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
);

const MuteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
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

const VideoIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const PlaylistAddIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 12H3M16 6H3M16 18H3M18 9v6M21 12h-6" />
    </svg>
);

const LoopIcon = ({ active }: { active: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity={active ? 1 : 0.4}>
        <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
);

const SpeedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" />
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
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
    const { showVideo, setShowVideo } = useMusic();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Advanced controls
    const [isLooping, setIsLooping] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);



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
        const newVolume = Math.max(0, Math.min(1, percent));
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(prevVolume);
            setIsMuted(false);
        } else {
            setPrevVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
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

    // Advanced control handlers
    const handleDownload = () => {
        if (!track) return;
        const url = getDownloadUrl(track);
        window.open(url, '_blank');
    };

    const handleLike = async () => {
        if (!track) return;
        try {
            if (isLiked) {
                await likesAPI.unlikeSong(track.id);
                setIsLiked(false);
            } else {
                await likesAPI.likeSong({
                    trackId: track.id,
                    title: track.title,
                    artist: track.artist,
                    thumbnail: track.thumbnail,
                    duration: track.duration,
                });
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error liking/unliking track:', error);
        }
    };

    const handleAddToPlaylist = async () => {
        if (!track) return;
        try {
            const response = await playlistsAPI.getPlaylists();
            setPlaylists(response.data);
            setShowPlaylistModal(true);
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    };

    const handleRewind = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        }
    };

    const handleForward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
        }
    };

    const toggleLoop = () => {
        setIsLooping(!isLooping);
        if (audioRef.current) {
            audioRef.current.loop = !isLooping;
        }
    };

    const cycleSpeed = () => {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(playbackSpeed);
        const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
        setPlaybackSpeed(nextSpeed);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextSpeed;
        }
    };

    const handleShowInfo = async () => {
        if (!track) return;
        setShowInfoModal(true);
        setLoadingDetails(true);
        try {
            const details = await getVideoDetails(track.id);
            setVideoDetails(details);
        } catch (error) {
            console.error('Error fetching video details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Check if track is liked when it changes
    useEffect(() => {
        const checkLikedStatus = async () => {
            if (!track) {
                setIsLiked(false);
                return;
            }
            try {
                const response = await likesAPI.getLikedSongs();
                const liked = response.data.some((song: any) => song.trackId === track.id);
                setIsLiked(liked);
            } catch (error) {
                console.error('Error checking liked status:', error);
            }
        };
        checkLikedStatus();
    }, [track]);

    // Add to listening history when a track starts playing
    useEffect(() => {
        if (!track || !isPlaying) return;

        // Wait a bit to ensure the user is actually listening
        const timer = setTimeout(async () => {
            try {
                await historyAPI.addToHistory({
                    trackId: track.id,
                    title: track.title,
                    artist: track.artist,
                    thumbnail: track.thumbnail,
                    duration: track.duration,
                });
            } catch (error) {
                console.error('Error adding to history:', error);
            }
        }, 3000); // Wait 3 seconds before adding to history

        return () => clearTimeout(timer);
    }, [track, isPlaying]);


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
                        <button className="control-button" disabled><Rewind10Icon /></button>
                        <button className="control-button" disabled><PrevIcon /></button>
                        <button className="control-button play" disabled><PlayIcon /></button>
                        <button className="control-button" disabled><NextIcon /></button>
                        <button className="control-button" disabled><Forward10Icon /></button>
                    </div>
                    <div className="progress-container">
                        <span className="progress-time">0:00</span>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: 0 }} />
                        </div>
                        <span className="progress-time">0:00</span>
                    </div>
                </div>
                <div className="player-right">
                    <div className="player-extras">
                        <button className="extra-button" disabled><DownloadIcon /></button>
                        <button className="extra-button" disabled><HeartIcon filled={false} /></button>
                        <button className="extra-button" disabled><PlaylistAddIcon /></button>
                        <button className="extra-button" disabled><LoopIcon active={false} /></button>
                        <button className="extra-button" disabled><SpeedIcon /></button>
                        <button className="extra-button" disabled><VideoIcon /></button>
                    </div>
                    <div className="player-volume">
                        <button className="volume-icon-button" onClick={toggleMute}>
                            {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
                        </button>
                        <div className="volume-slider">
                            <div className="volume-fill" style={{ width: '80%' }} />
                        </div>
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
                    <button className="control-button" onClick={handleRewind} title="Rewind 10s">
                        <Rewind10Icon />
                    </button>
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
                    <button className="control-button" onClick={handleForward} title="Forward 10s">
                        <Forward10Icon />
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

            <div className="player-right">
                <div className="player-extras">
                    <button
                        className="extra-button"
                        onClick={handleDownload}
                        title="Download"
                        disabled={!track}
                    >
                        <DownloadIcon />
                    </button>
                    <button
                        className={`extra-button ${isLiked ? 'active liked' : ''}`}
                        onClick={handleLike}
                        title={isLiked ? 'Unlike' : 'Like'}
                        disabled={!track}
                    >
                        <HeartIcon filled={isLiked} />
                    </button>
                    <button
                        className="extra-button"
                        onClick={handleAddToPlaylist}
                        title="Add to Playlist"
                        disabled={!track}
                    >
                        <PlaylistAddIcon />
                    </button>
                    <button
                        className={`extra-button ${isLooping ? 'active' : ''}`}
                        onClick={toggleLoop}
                        title={`Loop: ${isLooping ? 'On' : 'Off'}`}
                        disabled={!track}
                    >
                        <LoopIcon active={isLooping} />
                    </button>
                    <button
                        className="extra-button speed-button"
                        onClick={cycleSpeed}
                        title={`Playback Speed: ${playbackSpeed}x`}
                        disabled={!track}
                    >
                        <SpeedIcon />
                        {playbackSpeed !== 1 && (
                            <span className="speed-indicator">{playbackSpeed}x</span>
                        )}
                    </button>
                    <button
                        className={`extra-button ${showVideo ? 'active' : ''}`}
                        onClick={() => setShowVideo(!showVideo)}
                        title={showVideo ? 'Hide Video' : 'Show Video'}
                        disabled={!track}
                    >
                        <VideoIcon />
                    </button>
                    <button
                        className="extra-button"
                        onClick={handleShowInfo}
                        title="Track Info"
                        disabled={!track}
                    >
                        <InfoIcon />
                    </button>
                </div>

                <div className="player-volume">
                    <button className="volume-icon-button" onClick={toggleMute}>
                        {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
                    </button>
                    <div className="volume-slider" onClick={handleVolumeClick}>
                        <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Playlist Modal */}
            {showPlaylistModal && (
                <div className="modal-overlay" onClick={() => setShowPlaylistModal(false)}>
                    <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Add to Playlist</h3>
                        <div className="modal-list">
                            {playlists.length === 0 ? (
                                <p className="empty-text">No playlists yet. Create one first!</p>
                            ) : (
                                playlists.map(playlist => (
                                    <button
                                        key={playlist.id}
                                        className="modal-list-item"
                                        onClick={async () => {
                                            try {
                                                await playlistsAPI.addTrack(playlist.id, {
                                                    trackId: track!.id,
                                                    title: track!.title,
                                                    artist: track!.artist,
                                                    thumbnail: track!.thumbnail,
                                                    duration: track!.duration,
                                                });
                                                setShowPlaylistModal(false);
                                            } catch (error) {
                                                console.error('Error adding to playlist:', error);
                                            }
                                        }}
                                    >
                                        {playlist.name}
                                    </button>
                                ))
                            )}
                        </div>
                        <button className="modal-close-btn" onClick={() => setShowPlaylistModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {showInfoModal && (
                <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="modal-content info-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Track Details</h3>
                        {loadingDetails ? (
                            <div className="loading">
                                <div className="loading-spinner" />
                            </div>
                        ) : videoDetails ? (
                            <div className="info-content">
                                <div className="info-thumbnail">
                                    <img src={videoDetails.thumbnailHD} alt={videoDetails.title} />
                                </div>
                                <div className="info-section">
                                    <h4 className="info-title">{videoDetails.title}</h4>
                                </div>
                                <div className="info-section">
                                    <label>Channel</label>
                                    <p>{videoDetails.channelName}</p>
                                </div>
                                {videoDetails.subscriberCount && (
                                    <div className="info-section">
                                        <label>Subscribers</label>
                                        <p>{formatNumber(videoDetails.subscriberCount)}</p>
                                    </div>
                                )}
                                {videoDetails.viewCount && (
                                    <div className="info-section">
                                        <label>Views</label>
                                        <p>{formatNumber(videoDetails.viewCount)} views</p>
                                    </div>
                                )}
                                {videoDetails.likeCount && (
                                    <div className="info-section">
                                        <label>Likes</label>
                                        <p>{formatNumber(videoDetails.likeCount)}</p>
                                    </div>
                                )}
                                {videoDetails.uploadDate && (
                                    <div className="info-section">
                                        <label>Upload Date</label>
                                        <p>{videoDetails.uploadDate}</p>
                                    </div>
                                )}
                                {videoDetails.description && (
                                    <div className="info-section">
                                        <label>Description</label>
                                        <p className="info-description">{videoDetails.description}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="empty-text">Failed to load track details</p>
                        )}
                        <button className="modal-close-btn" onClick={() => setShowInfoModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to format large numbers
function formatNumber(num: string | number): string {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(n)) return num.toString();
    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}
