'use client';

import { useState, useEffect } from 'react';
import { Track } from '@/lib/api';
import { getDownloadUrl } from '@/lib/api';
import { likesAPI, playlistsAPI } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ListPlus, Plus, Download } from 'lucide-react';

interface TrackListProps {
    tracks: Track[];
    currentTrack: Track | null;
    onTrackSelect: (track: Track) => void;
    onAddToQueue: (track: Track) => void;
}

export default function TrackList({ tracks, currentTrack, onTrackSelect, onAddToQueue }: TrackListProps) {
    const { isAuthenticated } = useAuth();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<Track | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchLikedTracks();
            fetchPlaylists();
        }
    }, [isAuthenticated]);

    const fetchLikedTracks = async () => {
        try {
            const response = await likesAPI.getLikedSongs();
            const likedIds = new Set<string>(response.data.map((song: any) => song.trackId));
            setLikedTracks(likedIds);
        } catch (err) {
            // Silently fail - user might not be authenticated
        }
    };

    const fetchPlaylists = async () => {
        try {
            const response = await playlistsAPI.getPlaylists();
            setPlaylists(response.data);
        } catch (err) {
            // Silently fail - user might not be authenticated
        }
    };

    const handleLike = async (track: Track) => {
        try {
            if (likedTracks.has(track.id)) {
                await likesAPI.unlikeSong(track.id);
                setLikedTracks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(track.id);
                    return newSet;
                });
            } else {
                await likesAPI.likeSong({
                    trackId: track.id,
                    title: track.title,
                    artist: track.artist,
                    thumbnail: track.thumbnail,
                    duration: track.duration,
                });
                setLikedTracks(prev => new Set(prev).add(track.id));
            }
            setOpenMenuId(null);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to like song');
        }
    };

    const handleAddToPlaylist = (track: Track) => {
        setSelectedTrackForPlaylist(track);
        setShowPlaylistModal(true);
        setOpenMenuId(null);
    };

    const handlePlaylistSelect = async (playlistId: string) => {
        if (!selectedTrackForPlaylist) return;

        try {
            await playlistsAPI.addTrack(playlistId, {
                trackId: selectedTrackForPlaylist.id,
                title: selectedTrackForPlaylist.title,
                artist: selectedTrackForPlaylist.artist,
                thumbnail: selectedTrackForPlaylist.thumbnail,
                duration: selectedTrackForPlaylist.duration,
            });
            setShowPlaylistModal(false);
            setSelectedTrackForPlaylist(null);
            alert('Added to playlist!');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to add to playlist');
        }
    };

    const handleDownload = async (track: Track) => {
        try {
            const url = getDownloadUrl(track);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${track.title} - ${track.artist}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
        setOpenMenuId(null);
    };

    const toggleMenu = (trackId: string) => {
        setOpenMenuId(openMenuId === trackId ? null : trackId);
    };

    if (tracks.length === 0) {
        return null;
    }

    return (
        <>
            <div className="track-list">
                {tracks.map((track) => (
                    <div
                        key={track.id}
                        className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                    >
                        <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="track-thumbnail"
                            onClick={() => onTrackSelect(track)}
                        />
                        <div className="track-info" onClick={() => onTrackSelect(track)}>
                            <h3 className="track-title">{track.title}</h3>
                            <p className="track-artist">{track.artist}</p>
                        </div>
                        <span className="track-duration">{track.duration}</span>

                        {/* Three-dots menu */}
                        <div className="track-menu-container">
                            <button
                                className="track-menu-button"
                                onClick={() => toggleMenu(track.id)}
                                aria-label="Track options"
                            >
                                ⋮
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
                                            onClick={() => handleLike(track)}
                                        >
                                            <Heart
                                                size={16}
                                                fill={likedTracks.has(track.id) ? 'currentColor' : 'none'}
                                            />
                                            {likedTracks.has(track.id) ? 'Unlike' : 'Like'}
                                        </button>
                                        <button
                                            className="track-menu-item"
                                            onClick={() => handleAddToPlaylist(track)}
                                        >
                                            <ListPlus size={16} />
                                            Add to Playlist
                                        </button>
                                        <button
                                            className="track-menu-item"
                                            onClick={() => {
                                                onAddToQueue(track);
                                                setOpenMenuId(null);
                                            }}
                                        >
                                            <Plus size={16} />
                                            Add to Queue
                                        </button>
                                        <button
                                            className="track-menu-item"
                                            onClick={() => handleDownload(track)}
                                        >
                                            <Download size={16} />
                                            Download
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Playlist Selection Modal */}
            {showPlaylistModal && (
                <div className="modal-overlay" onClick={() => setShowPlaylistModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Add to Playlist</h2>
                        {playlists.length === 0 ? (
                            <p className="empty-text">No playlists yet. Create one first!</p>
                        ) : (
                            <div className="playlist-select-list">
                                {playlists.map(playlist => (
                                    <button
                                        key={playlist.id}
                                        className="playlist-select-item"
                                        onClick={() => handlePlaylistSelect(playlist.id)}
                                    >
                                        <span>{playlist.name}</span>
                                        <span className="text-muted">→</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowPlaylistModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
