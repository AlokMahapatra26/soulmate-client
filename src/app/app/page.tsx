'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import TrackList from '@/components/TrackList';
import { Track, searchMusic } from '@/lib/api';
import { useMusic } from '@/contexts/MusicContext';

export default function Home() {
  const music = useMusic();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string, searchType: 'music' | 'video' = 'music') => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchMusic(query, searchType);
      setTracks(results);
    } catch (err) {
      setError('Unable to search. Please check if the server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="player-page">
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
          currentTrack={music.currentTrack}
          onTrackSelect={music.playTrack}
          onAddToQueue={music.addToQueue}
        />
      )}
    </div>
  );
}
