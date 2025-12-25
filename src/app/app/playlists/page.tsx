'use client';

import { useState, useEffect } from 'react';
import { playlistsAPI } from '@/lib/apiClient';
import { useMusic } from '@/contexts/MusicContext';
import { ChevronDown, ChevronRight, Trash2, Plus, Pencil, ArrowLeft, Play } from 'lucide-react';

export default function PlaylistsPage() {
    const music = useMusic();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
    const [playlistTracks, setPlaylistTracks] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

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

    const handlePlaylistClick = (playlist: any) => {
        setSelectedPlaylist(playlist);
        fetchPlaylistTracks(playlist.id);
    };

    const handleBack = () => {
        setSelectedPlaylist(null);
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

    const handleEditClick = (playlist: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPlaylistId(playlist.id);
        setEditName(playlist.name);
        setEditDesc(playlist.description || '');
        setShowEditModal(true);
    };

    const handleUpdatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlaylistId) return;

        try {
            await playlistsAPI.updatePlaylist(editingPlaylistId, {
                name: editName,
                description: editDesc
            });
            setShowEditModal(false);
            setEditingPlaylistId(null);
            fetchPlaylists();
        } catch (err) {
            console.error('Failed to update playlist:', err);
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
                <button className="btn-small primary" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} />
                    Create Playlist
                </button>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : selectedPlaylist ? (
                // Detail View
                <div className="playlist-detail-view">
                    <div className="playlist-detail-header">
                        <div className="playlist-detail-left">
                            <button className="back-button" onClick={handleBack}>
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <h2 className="playlist-detail-title">{selectedPlaylist.name}</h2>
                                {selectedPlaylist.description && (
                                    <p className="playlist-detail-desc">{selectedPlaylist.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="playlist-actions">
                            <button
                                onClick={(e) => handleEditClick(selectedPlaylist, e)}
                                className="playlist-action-btn"
                                title="Edit Playlist"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={(e) => {
                                    handleDeletePlaylist(selectedPlaylist.id);
                                    setSelectedPlaylist(null);
                                }}
                                className="playlist-action-btn delete"
                                title="Delete Playlist"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="playlist-tracks-list">
                        {!playlistTracks[selectedPlaylist.id] ? (
                            <div className="loading-small">Loading tracks...</div>
                        ) : playlistTracks[selectedPlaylist.id].length === 0 ? (
                            <div className="empty-tracks">No tracks in this playlist yet</div>
                        ) : (
                            playlistTracks[selectedPlaylist.id].map((track: any, index: number) => (
                                <div
                                    key={track.id}
                                    className={`playlist-track-row clickable ${music.currentTrack?.id === track.trackId ? 'playing' : ''}`}
                                    onClick={() => handlePlayTrack(selectedPlaylist.id, track, playlistTracks[selectedPlaylist.id])}
                                >
                                    <span className="track-index">{index + 1}</span>
                                    <img src={track.thumbnail} alt={track.title} className="track-thumb-small" />
                                    <div className="track-info-col">
                                        <h4 className="track-name-row">{track.title}</h4>
                                        <p className="track-artist-row">{track.artist}</p>
                                    </div>
                                    <span className="track-duration-row">{track.duration}</span>
                                    <button
                                        onClick={(e) => handleRemoveTrack(selectedPlaylist.id, track.trackId, e)}
                                        className="remove-track-btn"
                                        title="Remove from playlist"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                // Grid View
                <>
                    {playlists.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-text">No playlists yet. Create one to get started!</p>
                        </div>
                    ) : (
                        <div className="playlists-grid">
                            {playlists.map(playlist => {
                                const coverImage = playlist.tracks?.find((t: any) => t.thumbnail)?.thumbnail;
                                return (
                                    <div
                                        key={playlist.id}
                                        className={`playlist-card ${coverImage ? 'has-cover' : ''}`}
                                        onClick={() => handlePlaylistClick(playlist)}
                                        style={coverImage ? { backgroundImage: `url(${coverImage})` } : {}}
                                    >
                                        <div className="playlist-card-overlay" />
                                        <div className="playlist-card-content">
                                            <h3 className="playlist-card-title">{playlist.name}</h3>
                                            <p className="playlist-card-count">
                                                {playlist.tracks?.length || 0} songs
                                            </p>
                                        </div>
                                        <div className="playlist-card-hover">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Create Playlist Modal */}
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

            {/* Edit Playlist Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Edit Playlist</h2>
                        <form onSubmit={handleUpdatePlaylist} className="modal-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    placeholder="Playlist Name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (optional)</label>
                                <textarea
                                    className="form-input"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    placeholder="Describe your playlist..."
                                    rows={3}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
