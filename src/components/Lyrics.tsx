'use client';

import { useState, useEffect, useRef } from 'react';
import { LyricsResult, getLyrics } from '@/lib/api';
import { Track } from '@/lib/api';

interface LyricsProps {
    track: Track | null;
    currentTime: number;
    isVisible: boolean;
    onClose: () => void;
}

export default function Lyrics({ track, currentTime }: LyricsProps) {
    const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);

    // Fetch lyrics when track changes
    useEffect(() => {
        if (!track) {
            setLyrics(null);
            return;
        }

        const fetchLyrics = async () => {
            setIsLoading(true);
            setError(null);
            setActiveLineIndex(-1);

            try {
                const result = await getLyrics(track.title, track.artist);
                setLyrics(result);
                if (!result) {
                    setError('Lyrics not found');
                }
            } catch (err) {
                console.error('Failed to fetch lyrics:', err);
                setError('Failed to load lyrics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLyrics();
    }, [track]);

    // Update active line based on current time
    useEffect(() => {
        if (!lyrics?.syncedLyrics) return;

        const lines = lyrics.syncedLyrics;
        let newActiveIndex = -1;

        for (let i = lines.length - 1; i >= 0; i--) {
            if (currentTime >= lines[i].time) {
                newActiveIndex = i;
                break;
            }
        }

        if (newActiveIndex !== activeLineIndex) {
            setActiveLineIndex(newActiveIndex);
        }
    }, [currentTime, lyrics, activeLineIndex]);

    // Auto-scroll to active line
    useEffect(() => {
        if (activeLineRef.current && containerRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeLineIndex]);

    const MusicIcon = () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
    );

    return (
        <div className="lyrics-panel">
            <div className="lyrics-panel-header">
                <h3>Lyrics</h3>
            </div>

            <div className="lyrics-panel-content" ref={containerRef}>
                {!track && (
                    <div className="lyrics-empty">
                        <MusicIcon />
                        <p>Select a track to view lyrics</p>
                    </div>
                )}

                {track && isLoading && (
                    <div className="lyrics-loading">
                        <div className="loading-spinner" />
                        <span>Loading lyrics...</span>
                    </div>
                )}

                {track && error && !isLoading && (
                    <div className="lyrics-error">
                        <MusicIcon />
                        <span>{error}</span>
                    </div>
                )}

                {lyrics?.instrumental && (
                    <div className="lyrics-instrumental">
                        <MusicIcon />
                        <span>Instrumental track</span>
                    </div>
                )}

                {lyrics?.syncedLyrics && lyrics.syncedLyrics.length > 0 && (
                    <div className="lyrics-synced">
                        {lyrics.syncedLyrics.map((line, index) => (
                            <div
                                key={index}
                                ref={index === activeLineIndex ? activeLineRef : null}
                                className={`lyric-line ${index === activeLineIndex ? 'active' : ''} ${index < activeLineIndex ? 'passed' : ''}`}
                            >
                                {line.text}
                            </div>
                        ))}
                    </div>
                )}

                {lyrics && !lyrics.syncedLyrics && lyrics.plainLyrics && (
                    <div className="lyrics-plain">
                        {lyrics.plainLyrics.split('\n').map((line, index) => (
                            <div key={index} className="lyric-line plain">
                                {line || '\u00A0'}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
