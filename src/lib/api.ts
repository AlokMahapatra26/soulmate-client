const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    thumbnail: string;
    thumbnailHD: string;
}

export interface StreamInfo {
    url: string;
    mimeType: string;
    bitrate: number;
}

export interface LyricLine {
    time: number;
    text: string;
}

export interface LyricsResult {
    id: number;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string | null;
    syncedLyrics: LyricLine[] | null;
}

export interface VideoDetails {
    id: string;
    title: string;
    channelName: string;
    channelId: string;
    subscriberCount?: string;
    viewCount?: string;
    likeCount?: string;
    uploadDate?: string;
    description?: string;
    thumbnail: string;
    thumbnailHD: string;
    duration?: string;
}

export async function searchMusic(query: string, searchType: 'music' | 'video' = 'music'): Promise<Track[]> {
    const endpoint = searchType === 'video'
        ? `${API_BASE}/api/music/search/videos?q=${encodeURIComponent(query)}`
        : `${API_BASE}/api/music/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error('Search failed');
    }

    return response.json();
}

export async function getStreamUrl(videoId: string): Promise<StreamInfo> {
    const response = await fetch(`${API_BASE}/api/music/stream/${videoId}`);

    if (!response.ok) {
        throw new Error('Failed to get stream');
    }

    return response.json();
}

export async function getVideoDetails(videoId: string): Promise<VideoDetails> {
    const response = await fetch(`${API_BASE}/api/music/details/${videoId}`);

    if (!response.ok) {
        throw new Error('Failed to get video details');
    }

    return response.json();
}

export async function getLyrics(
    track: string,
    artist: string,
    duration?: number
): Promise<LyricsResult | null> {
    const params = new URLSearchParams({
        track: track,
        artist: artist,
    });

    if (duration) {
        params.append('duration', duration.toString());
    }

    const response = await fetch(`${API_BASE}/api/music/lyrics?${params}`);

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error('Failed to get lyrics');
    }

    return response.json();
}

export function getDownloadUrl(track: Track): string {
    const params = new URLSearchParams({
        title: track.title,
        artist: track.artist,
    });
    return `${API_BASE}/api/music/download/${track.id}?${params}`;
}


