'use client';

import { useState, useEffect } from 'react';
import { friendsAPI, usersAPI } from '@/lib/apiClient';
import Link from 'next/link';

export default function FriendsPage() {
    const [friends, setFriends] = useState<any[]>([]);
    const [requests, setRequests] = useState<any>({ received: [], sent: [] });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                friendsAPI.getFriends(),
                friendsAPI.getRequests(),
            ]);
            setFriends(friendsRes.data);
            setRequests(requestsRes.data);
        } catch (err) {
            console.error('Failed to fetch friends data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const response = await usersAPI.searchUsers(searchQuery);
            setSearchResults(response.data);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            await friendsAPI.sendRequest(userId);
            alert('Friend request sent!');
            setSearchResults([]);
            setSearchQuery('');
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to send request');
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            await friendsAPI.acceptRequest(requestId);
            fetchData();
        } catch (err) {
            console.error('Failed to accept request:', err);
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await friendsAPI.rejectRequest(requestId);
            fetchData();
        } catch (err) {
            console.error('Failed to reject request:', err);
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!confirm('Remove this friend?')) return;
        try {
            await friendsAPI.removeFriend(friendId);
            fetchData();
        } catch (err) {
            console.error('Failed to remove friend:', err);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Friends</h1>
            </div>

            {/* Search Users */}
            <div className="search-section">
                <h2 className="section-title">Find Friends</h2>
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} className="btn-primary">Search</button>
                </div>
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map(user => (
                            <div key={user.id} className="list-item">
                                <div className="list-item-info">
                                    <h3 className="list-item-title">{user.name}</h3>
                                    <p className="list-item-subtitle">{user.email}</p>
                                </div>
                                <button onClick={() => handleSendRequest(user.id)} className="btn-small">
                                    Add Friend
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Friend Requests */}
            {requests.received.length > 0 && (
                <div className="section">
                    <h2 className="section-title">Friend Requests</h2>
                    <div className="list-container">
                        {requests.received.map((req: any) => (
                            <div key={req.id} className="list-item">
                                <div className="list-item-info">
                                    <h3 className="list-item-title">{req.sender.name}</h3>
                                    <p className="list-item-subtitle">{req.sender.email}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleAccept(req.id)} className="btn-small primary">Accept</button>
                                    <button onClick={() => handleReject(req.id)} className="btn-small">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            <div className="section">
                <h2 className="section-title">My Friends ({friends.length})</h2>
                {loading ? (
                    <div className="loading"><div className="loading-spinner" /></div>
                ) : friends.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-text">No friends yet. Search for users to add!</p>
                    </div>
                ) : (
                    <div className="list-container">
                        {friends.map(friend => (
                            <div key={friend.id} className="list-item">
                                <div className="list-item-info">
                                    <h3 className="list-item-title">{friend.name}</h3>
                                    <p className="list-item-subtitle">{friend.email}</p>
                                </div>
                                <button onClick={() => handleRemoveFriend(friend.id)} className="btn-icon-danger">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="page-nav">
                <Link href="/app" className="back-link">← Back to Player</Link>
            </div>
        </div>
    );
}
