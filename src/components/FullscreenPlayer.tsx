'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, getLyrics, LyricsResult } from '@/lib/api';

interface FullscreenPlayerProps {
    track: Track | null;
    currentTime: number;
    isVisible: boolean;
    onClose: () => void;
    audioElement: HTMLAudioElement | null;
}

export default function FullscreenPlayer({
    track,
    currentTime,
    isVisible,
    onClose,
    audioElement,
}: FullscreenPlayerProps) {
    const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);
    const [dominantColor, setDominantColor] = useState('rgba(20, 20, 20, 1)');
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const lyricsContainerRef = useRef<HTMLDivElement>(null);

    // Extract dominant color from image
    const extractDominantColor = useCallback((imageUrl: string) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);

            try {
                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < imageData.length; i += 4) {
                    // Skip very dark and very light pixels
                    const brightness = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
                    if (brightness > 30 && brightness < 220) {
                        r += imageData[i];
                        g += imageData[i + 1];
                        b += imageData[i + 2];
                        count++;
                    }
                }

                if (count > 0) {
                    r = Math.floor(r / count);
                    g = Math.floor(g / count);
                    b = Math.floor(b / count);
                    setDominantColor(`rgba(${r}, ${g}, ${b}, 0.3)`);
                }
            } catch (e) {
                console.error('Failed to extract color:', e);
            }
        };
        img.src = imageUrl;
    }, []);

    // Fetch lyrics
    useEffect(() => {
        if (!track || !isVisible) return;

        const fetchLyrics = async () => {
            setIsLoading(true);
            try {
                const result = await getLyrics(track.title, track.artist);
                setLyrics(result);
            } catch (err) {
                console.error('Failed to fetch lyrics:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLyrics();
        extractDominantColor(track.thumbnailHD || track.thumbnail);
    }, [track, isVisible, extractDominantColor]);

    // Update active lyric line
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

    // Auto-scroll lyrics
    useEffect(() => {
        if (lyricsContainerRef.current && activeLineIndex !== -1) {
            const activeElement = lyricsContainerRef.current.children[activeLineIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [activeLineIndex]);

    // Audio visualizer - Animated fallback (Web Audio API doesn't work with streaming audio due to CORS)
    useEffect(() => {
        if (!isVisible || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Animation state
        const barCount = 32;
        const barHeights = new Array(barCount).fill(0);
        const targetHeights = new Array(barCount).fill(0);
        let phase = 0;
        let lastTime = performance.now();

        const draw = (currentTime: number) => {
            if (!isVisible) return;

            const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to ~60fps
            lastTime = currentTime;

            animationRef.current = requestAnimationFrame(draw);

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const barWidth = width / barCount;
            const gap = 3;

            // Check if audio is playing
            const isPlaying = audioElement && !audioElement.paused;

            // Update phase for wave animation
            phase += (isPlaying ? 0.12 : 0.03) * deltaTime;

            for (let i = 0; i < barCount; i++) {
                // Generate wave pattern using multiple frequencies
                const freq1 = Math.sin(phase + i * 0.25);
                const freq2 = Math.sin(phase * 1.7 + i * 0.18);
                const freq3 = Math.sin(phase * 0.6 + i * 0.4);
                const freq4 = Math.cos(phase * 2.1 + i * 0.12);

                // Create more dynamic center-weighted distribution
                const centerWeight = 1 - Math.abs((i - barCount / 2) / (barCount / 2)) * 0.3;

                // Combine waves with random-like variation
                const waveValue = (freq1 * 0.35 + freq2 * 0.25 + freq3 * 0.25 + freq4 * 0.15) * 0.5 + 0.5;

                // Set target height
                if (isPlaying) {
                    targetHeights[i] = waveValue * height * 0.85 * centerWeight;
                } else {
                    targetHeights[i] = 4 + Math.sin(phase * 0.5 + i * 0.2) * 2;
                }

                // Smooth interpolation with faster response
                const smoothing = isPlaying ? 0.18 : 0.08;
                barHeights[i] += (targetHeights[i] - barHeights[i]) * smoothing * deltaTime;

                const barHeight = Math.max(4, barHeights[i]);
                const x = i * barWidth + gap / 2;
                const y = height - barHeight;

                // Create gradient-like effect with varying opacity
                const brightness = isPlaying ? 0.5 + (barHeight / height) * 0.5 : 0.25;

                // Add subtle color tint based on bar position
                const hue = 0; // Keep white but could add color
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;

                // Draw rounded bars
                const radius = Math.min(3, (barWidth - gap) / 2);
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth - gap, barHeight, [radius, radius, 0, 0]);
                ctx.fill();
            }
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isVisible, audioElement]);

    if (!isVisible || !track) return null;

    const CloseIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );

    return (
        <div
            className="fullscreen-player"
            style={{ background: `linear-gradient(180deg, ${dominantColor} 0%, rgba(9, 9, 11, 1) 100%)` }}
        >
            <button className="fullscreen-close" onClick={onClose}>
                <CloseIcon />
            </button>

            <div className="fullscreen-content">
                <div className="fullscreen-poster">
                    <img
                        src={track.thumbnailHD || track.thumbnail}
                        alt={track.title}
                        className="fullscreen-poster-img"
                    />
                </div>

                <div className="fullscreen-info">
                    <h2 className="fullscreen-title">{track.title}</h2>
                    <p className="fullscreen-artist">{track.artist}</p>
                </div>

                <canvas
                    ref={canvasRef}
                    className="fullscreen-visualizer"
                    width={400}
                    height={80}
                />

                <div className="fullscreen-lyrics" ref={lyricsContainerRef}>
                    {isLoading && (
                        <div className="fullscreen-lyrics-loading">
                            <div className="loading-spinner small" />
                        </div>
                    )}

                    {lyrics?.syncedLyrics?.map((line, index) => (
                        <div
                            key={index}
                            className={`fullscreen-lyric-line ${index === activeLineIndex ? 'active' : ''} ${index < activeLineIndex ? 'passed' : ''}`}
                        >
                            {line.text}
                        </div>
                    ))}

                    {lyrics && !lyrics.syncedLyrics && lyrics.plainLyrics && (
                        <div className="fullscreen-lyric-line plain">
                            {lyrics.plainLyrics}
                        </div>
                    )}

                    {!lyrics && !isLoading && (
                        <div className="fullscreen-lyrics-empty">
                            No lyrics available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
