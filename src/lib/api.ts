const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    thumbnail: string;
}

export interface StreamInfo {
    url: string;
    mimeType: string;
    bitrate: number;
}

export async function searchMusic(query: string): Promise<Track[]> {
    const response = await fetch(
        `${API_BASE}/api/music/search?q=${encodeURIComponent(query)}`
    );

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
