'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import TrackList from '@/components/TrackList';
import Player from '@/components/Player';
import NowPlaying from '@/components/NowPlaying';
import Lyrics from '@/components/Lyrics';
import { Track, searchMusic } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex === -1 && queue.length > 0) {
      setCurrentTrack(queue[0]);
    } else if (currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
    } else {
      setCurrentTrack(queue[0]);
    }
  };

  const handlePrevious = () => {
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

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlayingStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  return (
    <div className="app">
      {/* Top Navbar */}
      <nav className="navbar">
        <h1 className="navbar-logo">
          SOUL<span className="navbar-logo-accent">MATE</span>
        </h1>

        <div className="navbar-menu">
          <Link href="/app/playlists" className="navbar-link">Playlists</Link>
          <Link href="/app/liked" className="navbar-link">Liked</Link>
          <Link href="/app/history" className="navbar-link">History</Link>
          <Link href="/app/friends" className="navbar-link">Friends</Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="navbar-link admin">Admin</Link>
          )}

          <div className="user-menu-container">
            <button
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserIcon />
              <span>{user?.name}</span>
            </button>

            {showUserMenu && (
              <>
                <div className="menu-backdrop" onClick={() => setShowUserMenu(false)} />
                <div className="user-menu-dropdown">
                  <Link href="/app/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                    Profile
                  </Link>
                  <button onClick={() => { logout(); router.push('/landing'); }} className="user-menu-item">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
