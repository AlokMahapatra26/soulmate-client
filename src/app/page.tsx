'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import TrackList from '@/components/TrackList';
import Player from '@/components/Player';
import NowPlaying from '@/components/NowPlaying';
import Lyrics from '@/components/Lyrics';
import { Track, searchMusic } from '@/lib/api';

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
    setCurrentTrack(track);
  };

  const handleAddToQueue = (track: Track) => {
    // Check if track is already in queue
    const isInQueue = queue.some(t => t.id === track.id);
    if (!isInQueue) {
      setQueue([...queue, track]);
    }
  };

  const handleQueueItemClick = (track: Track) => {
    setCurrentTrack(track);
  };

  const handleQueueItemRemove = (trackId: string) => {
    setQueue(queue.filter(t => t.id !== trackId));
  };

  const handleNext = () => {
    if (queue.length === 0) return;

    // Find current track in queue
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);

    if (currentIndex === -1 && queue.length > 0) {
      // Current track not in queue, play first queue item
      setCurrentTrack(queue[0]);
    } else if (currentIndex < queue.length - 1) {
      // Play next track in queue
      setCurrentTrack(queue[currentIndex + 1]);
    } else {
      // At end of queue, loop to first track
      setCurrentTrack(queue[0]);
    }
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;

    // Find current track in queue
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);

    if (currentIndex === -1 && queue.length > 0) {
      // Current track not in queue, play last queue item
      setCurrentTrack(queue[queue.length - 1]);
    } else if (currentIndex > 0) {
      // Play previous track in queue
      setCurrentTrack(queue[currentIndex - 1]);
    } else {
      // At beginning of queue, loop to last track
      setCurrentTrack(queue[queue.length - 1]);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlayingStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  return (
    <div className="app">
      {/* Top Navbar */}
      <nav className="navbar">
        <h1 className="navbar-logo">
          SOUL<span className="navbar-logo-accent">MATE</span>
        </h1>
      </nav>

      {/* Main Layout */}
      <div className="layout">
        {/* Left Sidebar - Now Playing & Queue */}
        <aside className="sidebar-left">
          <NowPlaying
            track={currentTrack}
            queue={queue}
            onQueueItemClick={handleQueueItemClick}
            onQueueItemRemove={handleQueueItemRemove}
          />
        </aside>

        {/* Center - Search & Track List */}
        <main className="main">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div className="error-message">
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
              onAddToQueue={handleAddToQueue}
            />
          )}
        </main>

        {/* Right Sidebar - Lyrics */}
        <aside className="sidebar-right">
          <Lyrics
            track={currentTrack}
            currentTime={currentTime}
            isVisible={true}
            onClose={() => { }}
          />
        </aside>
      </div>

      {/* Bottom Player */}
      <Player
        track={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onTimeUpdate={handleTimeUpdate}
        onAudioReady={setAudioElement}
        onPlayingStateChange={handlePlayingStateChange}
      />
    </div>
  );
}
