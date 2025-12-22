'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playlistsAPI } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function PlaylistsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState<any[]>([]);
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

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Playlists</h1>
                    <p className="page-subtitle">Create and manage your music collections</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Create Playlist
                </button>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : playlists.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-text">No playlists yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid-container">
                    {playlists.map(playlist => (
                        <div key={playlist.id} className="card">
                            <div className="card-header">
                                <h3 className="card-title">{playlist.name}</h3>
                                <button onClick={() => handleDeletePlaylist(playlist.id)} className="btn-icon-danger">×</button>
                            </div>
                            {playlist.description && <p className="card-subtitle">{playlist.description}</p>}
                            <div className="card-footer">
                                <span className="text-muted">
                                    {new Date(playlist.createdAt).toLocaleDateString()}
                                </span>
                            </div>
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

            <div className="page-nav">
                <Link href="/app" className="back-link">← Back to Player</Link>
            </div>
        </div>
    );
}
