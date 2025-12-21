'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import TrackList from '@/components/TrackList';
import Player from '@/components/Player';
import Lyrics from '@/components/Lyrics';
import { Track, searchMusic } from '@/lib/api';

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchMusic(query);
      setTracks(results);
    } catch (err) {
      setError('Unable to search. Please check if the server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = (track: Track) => {
    const index = tracks.findIndex((t) => t.id === track.id);
    setCurrentTrack(track);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentIndex(nextIndex);
    setCurrentTrack(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentTrack(tracks[prevIndex]);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleLyricsToggle = () => {
    setShowLyrics(!showLyrics);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">
          SOUL<span className="logo-accent">MATE</span>
        </h1>
      </header>

      <main className="main-content">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner" />
          </div>
        ) : hasSearched && tracks.length === 0 && !error ? (
          <div className="empty-state">
            <p className="empty-text">No results found. Try a different search.</p>
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            currentTrack={currentTrack}
            onTrackSelect={handleTrackSelect}
          />
        )}
      </main>

      <Player
        track={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onTimeUpdate={handleTimeUpdate}
        onLyricsToggle={handleLyricsToggle}
        showLyrics={showLyrics}
      />

      <Lyrics
        track={currentTrack}
        currentTime={currentTime}
        isVisible={showLyrics}
        onClose={() => setShowLyrics(false)}
      />
    </div>
  );
}
