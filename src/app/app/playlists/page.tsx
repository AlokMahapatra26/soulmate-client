'use client';

import { useState, useEffect } from 'react';
import { playlistsAPI } from '@/lib/apiClient';
import { useMusic } from '@/contexts/MusicContext';
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';

export default function PlaylistsPage() {
    const music = useMusic();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
    const [playlistTracks, setPlaylistTracks] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const response = await playlistsAPI.getPlaylists();
            setPlaylists(response.data);
        } catch (err) {
            console.error('Failed to fetch playlists:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaylistTracks = async (playlistId: string) => {
        if (playlistTracks[playlistId]) return;

        try {
            const response = await playlistsAPI.getPlaylist(playlistId);
            setPlaylistTracks(prev => ({
                ...prev,
                [playlistId]: response.data.tracks || []
            }));
        } catch (err) {
            console.error('Failed to fetch playlist tracks:', err);
        }
    };

    const togglePlaylist = (playlistId: string) => {
        if (expandedPlaylistId === playlistId) {
            setExpandedPlaylistId(null);
        } else {
            setExpandedPlaylistId(playlistId);
            fetchPlaylistTracks(playlistId);
        }
    };

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await playlistsAPI.createPlaylist({ name: newPlaylistName, description: newPlaylistDesc });
            setShowCreateModal(false);
            setNewPlaylistName('');
            setNewPlaylistDesc('');
            fetchPlaylists();
        } catch (err) {
            console.error('Failed to create playlist:', err);
        }
    };

    const handleDeletePlaylist = async (id: string) => {
        if (!confirm('Delete this playlist?')) return;
        try {
            await playlistsAPI.deletePlaylist(id);
            fetchPlaylists();
        } catch (err) {
            console.error('Failed to delete playlist:', err);
        }
    };

    const handleRemoveTrack = async (playlistId: string, trackId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await playlistsAPI.removeTrack(playlistId, trackId);
            const response = await playlistsAPI.getPlaylist(playlistId);
            setPlaylistTracks(prev => ({
                ...prev,
                [playlistId]: response.data.tracks || []
            }));
        } catch (err) {
            console.error('Failed to remove track:', err);
        }
    };

    const handlePlayTrack = (playlistId: string, track: any, allTracks: any[]) => {
        // Convert all tracks to Track format
        const queueTracks = allTracks.map(t => ({
            id: t.trackId,
            title: t.title,
            artist: t.artist,
            thumbnail: t.thumbnail,
            thumbnailHD: t.thumbnailHD || t.thumbnail,
            duration: t.duration,
        }));

        // Set the entire playlist as queue
        music.setQueue(queueTracks);

        // Play the clicked track
        const trackToPlay = {
            id: track.trackId,
            title: track.title,
            artist: track.artist,
            thumbnail: track.thumbnail,
            thumbnailHD: track.thumbnailHD || track.thumbnail,
            duration: track.duration,
        };
        music.playTrack(trackToPlay);
    };

    return (
        <div className="playlists-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Playlists</h1>
                    <p className="page-subtitle">Create and manage your music collections</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} />
                    Create Playlist
                </button>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : playlists.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-text">No playlists yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="playlists-list">
                    {playlists.map(playlist => (
                        <div key={playlist.id} className="playlist-box">
                            <div className="playlist-header" onClick={() => togglePlaylist(playlist.id)}>
                                <div className="playlist-info-section">
                                    <button className="playlist-toggle">
                                        {expandedPlaylistId === playlist.id ?
                                            <ChevronDown size={20} /> : <ChevronRight size={20} />
                                        }
                                    </button>
                                    <div>
                                        <h3 className="playlist-name">{playlist.name}</h3>
                                        {playlist.description && (
                                            <p className="playlist-desc">{playlist.description}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }}
                                    className="playlist-delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {expandedPlaylistId === playlist.id && (
                                <div className="playlist-tracks">
                                    {!playlistTracks[playlist.id] ? (
                                        <div className="loading-small">Loading tracks...</div>
                                    ) : playlistTracks[playlist.id].length === 0 ? (
                                        <div className="empty-tracks">No tracks in this playlist yet</div>
                                    ) : (
                                        playlistTracks[playlist.id].map((track: any) => (
                                            <div
                                                key={track.id}
                                                className={`playlist-track-item clickable ${music.currentTrack?.id === track.trackId ? 'playing' : ''}`}
                                                onClick={() => handlePlayTrack(playlist.id, track, playlistTracks[playlist.id])}
                                            >
                                                <img src={track.thumbnail} alt={track.title} className="track-thumb" />
                                                <div className="track-details">
                                                    <h4 className="track-name">{track.title}</h4>
                                                    <p className="track-artist-name">{track.artist}</p>
                                                </div>
                                                <span className="track-time">{track.duration}</span>
                                                <button
                                                    onClick={(e) => handleRemoveTrack(playlist.id, track.trackId, e)}
                                                    className="remove-track-btn"
                                                    title="Remove from playlist"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Create Playlist</h2>
                        <form onSubmit={handleCreatePlaylist} className="modal-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    required
                                    placeholder="My Awesome Playlist"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (optional)</label>
                                <textarea
                                    className="form-input"
                                    value={newPlaylistDesc}
                                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                                    placeholder="Describe your playlist..."
                                    rows={3}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
