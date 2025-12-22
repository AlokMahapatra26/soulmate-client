import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data: { email: string; password: string; name: string }) =>
        apiClient.post('/api/auth/register', data),

    login: (data: { email: string; password: string }) =>
        apiClient.post('/api/auth/login', data),

    getMe: () =>
        apiClient.get('/api/auth/me'),

    checkStatus: (email: string) =>
        apiClient.get(`/api/auth/status/${email}`),
};

// Users API
export const usersAPI = {
    getPending: () =>
        apiClient.get('/api/users/pending'),

    approveUser: (userId: string) =>
        apiClient.put(`/api/users/${userId}/approve`),

    rejectUser: (userId: string) =>
        apiClient.put(`/api/users/${userId}/reject`),

    searchUsers: (query: string) =>
        apiClient.get(`/api/users/search/${query}`),
};

// Playlists API
export const playlistsAPI = {
    getPlaylists: () =>
        apiClient.get('/api/playlists'),

    getPlaylist: (id: string) =>
        apiClient.get(`/api/playlists/${id}`),

    createPlaylist: (data: { name: string; description?: string; isPublic?: string }) =>
        apiClient.post('/api/playlists', data),

    updatePlaylist: (id: string, data: { name?: string; description?: string; isPublic?: string }) =>
        apiClient.put(`/api/playlists/${id}`, data),

    deletePlaylist: (id: string) =>
        apiClient.delete(`/api/playlists/${id}`),

    getTracks: (playlistId: string) =>
        apiClient.get(`/api/playlists/${playlistId}/tracks`),

    addTrack: (playlistId: string, track: any) =>
        apiClient.post(`/api/playlists/${playlistId}/tracks`, track),

    removeTrack: (playlistId: string, trackId: string) =>
        apiClient.delete(`/api/playlists/${playlistId}/tracks/${trackId}`),
};

// Likes API
export const likesAPI = {
    getLikedSongs: () =>
        apiClient.get('/api/likes'),

    likeSong: (track: any) =>
        apiClient.post('/api/likes', track),

    unlikeSong: (trackId: string) =>
        apiClient.delete(`/api/likes/${trackId}`),

    checkLiked: (trackId: string) =>
        apiClient.get(`/api/likes/${trackId}/check`),
};

// History API
export const historyAPI = {
    getHistory: (limit?: number) =>
        apiClient.get('/api/history', { params: { limit } }),

    addToHistory: (track: any) =>
        apiClient.post('/api/history', track),
};

// Friends API
export const friendsAPI = {
    getFriends: () =>
        apiClient.get('/api/friends'),

    getRequests: () =>
        apiClient.get('/api/friends/requests'),

    sendRequest: (receiverId: string) =>
        apiClient.post('/api/friends/request', { receiverId }),

    acceptRequest: (requestId: string) =>
        apiClient.put(`/api/friends/request/${requestId}/accept`),

    rejectRequest: (requestId: string) =>
        apiClient.put(`/api/friends/request/${requestId}/reject`),

    removeFriend: (friendId: string) =>
        apiClient.delete(`/api/friends/${friendId}`),
};
