'use client';

import { useState, useEffect, useRef } from 'react';
import { LyricsResult, getLyrics } from '@/lib/api';
import { Track } from '@/lib/api';
import { useMusic } from '@/contexts/MusicContext';

interface LyricsProps {
    track: Track | null;
    currentTime: number;
    isVisible: boolean;
    onClose: () => void;
}

const ExpandIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
);

const CollapseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 14h6v6M20 10h-6V4M10 10l-7-7M14 14l7 7" />
    </svg>
);

const FontIncreaseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <text x="2" y="18" fontSize="14" fontWeight="bold" fill="currentColor" stroke="none">A</text>
        <line x1="16" y1="8" x2="16" y2="14" strokeWidth="2" strokeLinecap="round" />
        <line x1="13" y1="11" x2="19" y2="11" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const FontDecreaseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <text x="2" y="18" fontSize="14" fontWeight="bold" fill="currentColor" stroke="none">A</text>
        <line x1="13" y1="11" x2="19" y2="11" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const AlignLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
        <line x1="3" y1="12" x2="15" y2="12" strokeLinecap="round" />
        <line x1="3" y1="18" x2="18" y2="18" strokeLinecap="round" />
    </svg>
);

const AlignCenterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
        <line x1="6" y1="12" x2="18" y2="12" strokeLinecap="round" />
        <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
    </svg>
);

const AlignRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
        <line x1="9" y1="12" x2="21" y2="12" strokeLinecap="round" />
        <line x1="6" y1="18" x2="21" y2="18" strokeLinecap="round" />
    </svg>
);

export default function Lyrics({ track, currentTime }: LyricsProps) {
    const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);
    const { showExpandedLyrics, setShowExpandedLyrics } = useMusic();
    const [fontSize, setFontSize] = useState(1); // Scale: 0.6 to 1.8
    const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');

    const increaseFontSize = () => {
        setFontSize(prev => Math.min(prev + 0.2, 1.8));
    };

    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(prev - 0.2, 0.6));
    };

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
                <div className="lyrics-controls">
                    {showExpandedLyrics && (
                        <>
                            <button
                                className="lyrics-font-button"
                                onClick={decreaseFontSize}
                                title="Decrease font size"
                                disabled={fontSize <= 0.6}
                            >
                                <FontDecreaseIcon />
                            </button>
                            <button
                                className="lyrics-font-button"
                                onClick={increaseFontSize}
                                title="Increase font size"
                                disabled={fontSize >= 1.8}
                            >
                                <FontIncreaseIcon />
                            </button>
                            <div className="lyrics-divider" />
                            <button
                                className={`lyrics-align-button ${alignment === 'left' ? 'active' : ''}`}
                                onClick={() => setAlignment('left')}
                                title="Align left"
                            >
                                <AlignLeftIcon />
                            </button>
                            <button
                                className={`lyrics-align-button ${alignment === 'center' ? 'active' : ''}`}
                                onClick={() => setAlignment('center')}
                                title="Align center"
                            >
                                <AlignCenterIcon />
                            </button>
                            <button
                                className={`lyrics-align-button ${alignment === 'right' ? 'active' : ''}`}
                                onClick={() => setAlignment('right')}
                                title="Align right"
                            >
                                <AlignRightIcon />
                            </button>
                        </>
                    )}
                    <button
                        className="lyrics-expand-button"
                        onClick={() => setShowExpandedLyrics(!showExpandedLyrics)}
                        title={showExpandedLyrics ? "Collapse lyrics" : "Expand lyrics"}
                    >
                        {showExpandedLyrics ? <CollapseIcon /> : <ExpandIcon />}
                    </button>
                </div>
            </div>

            <div
                className={`lyrics-panel-content ${showExpandedLyrics ? 'expanded' : ''}`}
                ref={containerRef}
            >
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
                    <div className="lyrics-synced" style={{ textAlign: alignment }}>
                        {lyrics.syncedLyrics.map((line, index) => (
                            <div
                                key={index}
                                ref={index === activeLineIndex ? activeLineRef : null}
                                className={`lyric-line ${index === activeLineIndex ? 'active' : ''} ${index < activeLineIndex ? 'passed' : ''}`}
                                style={{
                                    fontSize: `${fontSize}em`,
                                    transform: index === activeLineIndex ? `scale(${1 + fontSize * 0.1})` : 'scale(1)'
                                }}
                            >
                                {line.text}
                            </div>
                        ))}
                    </div>
                )}

                {lyrics && !lyrics.syncedLyrics && lyrics.plainLyrics && (
                    <div className="lyrics-plain" style={{ textAlign: alignment }}>
                        {lyrics.plainLyrics.split('\n').map((line, index) => (
                            <div
                                key={index}
                                className="lyric-line plain"
                                style={{ fontSize: `${fontSize * 0.57}em` }}
                            >
                                {line || '\u00A0'}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
