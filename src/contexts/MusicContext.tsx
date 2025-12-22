'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Track } from '@/lib/api';

interface MusicContextType {
    currentTrack: Track | null;
    queue: Track[];
    isPlaying: boolean;
    currentTime: number;
    audioElement: HTMLAudioElement | null;
    setCurrentTrack: (track: Track | null) => void;
    setQueue: (queue: Track[]) => void;
    setIsPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setAudioElement: (element: HTMLAudioElement | null) => void;
    addToQueue: (track: Track) => void;
    removeFromQueue: (trackId: string) => void;
    playNext: () => void;
    playPrevious: () => void;
    playTrack: (track: Track) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [queue, setQueue] = useState<Track[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const addToQueue = (track: Track) => {
        const isInQueue = queue.some(t => t.id === track.id);
        if (!isInQueue) {
            setQueue([...queue, track]);
        }
    };

    const removeFromQueue = (trackId: string) => {
        setQueue(queue.filter(t => t.id !== trackId));
    };

    const playNext = () => {
        if (queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex === -1 && queue.length > 0) {
            setCurrentTrack(queue[0]);
        } else if (currentIndex < queue.length - 1) {
            setCurrentTrack(queue[currentIndex + 1]);
        } else {
            setCurrentTrack(queue[0]);
        }
    };

    const playPrevious = () => {
        if (queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex === -1 && queue.length > 0) {
            setCurrentTrack(queue[queue.length - 1]);
        } else if (currentIndex > 0) {
            setCurrentTrack(queue[currentIndex - 1]);
        } else {
            setCurrentTrack(queue[queue.length - 1]);
        }
    };

    const playTrack = (track: Track) => {
        setCurrentTrack(track);
    };

    return (
        <MusicContext.Provider
            value={{
                currentTrack,
                queue,
                isPlaying,
                currentTime,
                audioElement,
                setCurrentTrack,
                setQueue,
                setIsPlaying,
                setCurrentTime,
                setAudioElement,
                addToQueue,
                removeFromQueue,
                playNext,
                playPrevious,
                playTrack,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
}
