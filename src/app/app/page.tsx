'use client';

import { useState, useRef, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import TrackList from '@/components/TrackList';
import { Track, searchMusic } from '@/lib/api';
import { useMusic } from '@/contexts/MusicContext';
import {
  Compass,
  Globe,
  X,
  Shuffle
} from 'lucide-react';
import {
  MUSIC_TRIVIA,
  CHAOS_QUERIES,
  GENERIC_CHAOS_QUERIES,
  MOOD_DATA,
  MOODS,
  LANGUAGES
} from '@/lib/data';

export default function Home() {
  const music = useMusic();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isLoadingChaos, setIsLoadingChaos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [trivia, setTrivia] = useState({ type: "", text: "" });

  useEffect(() => {
    setTrivia(MUSIC_TRIVIA[Math.floor(Math.random() * MUSIC_TRIVIA.length)]);
  }, []);

  const moodHistoryRef = useRef<Record<string, Set<string>>>({});
  const chaosHistoryRef = useRef<Set<string>>(new Set());

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const getActiveLanguage = () => {
    if (selectedLanguages.length === 0) return 'Any';
    return selectedLanguages[Math.floor(Math.random() * selectedLanguages.length)];
  };

  const handleSearch = async (query: string, searchType: 'music' | 'video' = 'music') => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const results = await searchMusic(query, searchType);
      setTracks(results);
    } catch {
      setError('Unable to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setTracks([]);
    setHasSearched(false);
    setError(null);
  };

  const pickQualityTrack = (results: Track[], history: Set<string>) => {
    const pool = results
      .slice(0, 15)
      .filter(t => !history.has(t.id));

    const selected =
      pool[Math.floor(Math.random() * pool.length)] || results[0];

    history.add(selected.id);
    if (history.size > 25) history.clear();

    return selected;
  };

  const handleChaosPlay = async () => {
    setIsLoadingChaos(true);
    try {
      let query =
        CHAOS_QUERIES[Math.floor(Math.random() * CHAOS_QUERIES.length)];

      const activeLang = getActiveLanguage();
      if (activeLang !== 'Any') {
        query = `${activeLang} ${query}`;
      }

      const results = await searchMusic(query);
      if (!results.length) return;

      const track = pickQualityTrack(results, chaosHistoryRef.current);
      music.playTrack(track);
    } catch (err) {
      console.error('Chaos play failed:', err);
    } finally {
      setIsLoadingChaos(false);
    }
  };

  const handleMoodSelect = async (mood: string) => {
    setIsLoadingRandom(true);
    setShowMoodPicker(false);

    try {
      let query =
        MOOD_DATA[mood].queries[
        Math.floor(Math.random() * MOOD_DATA[mood].queries.length)
        ];

      const activeLang = getActiveLanguage();
      if (activeLang !== 'Any') {
        query = `${activeLang} ${query}`;
      }

      const results = await searchMusic(query);
      if (!results.length) return;

      const history =
        moodHistoryRef.current[mood] ??
        (moodHistoryRef.current[mood] = new Set());

      const track = pickQualityTrack(results, history);
      music.playTrack(track);
    } catch (err) {
      console.error('Mood play failed:', err);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <div className="player-page">
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <SearchBar
        onSearch={handleSearch}
        isLoading={isLoading}
        onClear={hasSearched ? handleClearSearch : undefined}
      />

      {!hasSearched && (
        <div className="empty-state-container">
          <div className="music-quote">
            <span className="trivia-type">{trivia.type}</span>
            <p>"{trivia.text}"</p>
          </div>

          <div className="language-filter-container">
            <button
              className={`language-filter-btn ${selectedLanguages.length > 0 ? 'active' : ''}`}
              onClick={() => setShowLanguageModal(true)}
            >
              <Globe size={14} />
              <span>
                {selectedLanguages.length === 0
                  ? 'Any Language'
                  : `${selectedLanguages.length} Selected`}
              </span>
            </button>
            {selectedLanguages.length > 0 && (
              <span className="language-disclaimer">
                *Results may vary by language availability
              </span>
            )}
          </div>

          <div className="discover-actions">
            <button
              className="discover-card"
              onClick={() => setShowMoodPicker(true)}
              disabled={isLoadingRandom || isLoadingChaos}
            >
              <Compass size={18} strokeWidth={1.5} />
              <span>Play by Mood</span>
              {isLoadingRandom && <div className="loading-spinner-small" />}
            </button>

            <button
              className="discover-card chaos-card"
              onClick={handleChaosPlay}
              disabled={isLoadingRandom || isLoadingChaos}
            >
              <Shuffle size={18} strokeWidth={1.5} />
              <span>Surprise Me</span>
              {isLoadingChaos && <div className="loading-spinner-small" />}
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="mood-picker-overlay" onClick={() => setShowLanguageModal(false)}>
          <div className="mood-picker language-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mood-picker-header">
              <h3>Select Languages</h3>
              <button className="mood-close-btn" onClick={() => setShowLanguageModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="language-grid">
              {LANGUAGES.filter(l => l !== 'Any').map((lang) => (
                <button
                  key={lang}
                  className={`lang-chip ${selectedLanguages.includes(lang) ? 'active' : ''}`}
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="language-modal-footer">
              <button
                className="clear-btn"
                onClick={() => setSelectedLanguages([])}
                disabled={selectedLanguages.length === 0}
              >
                Clear All
              </button>
              <button
                className="done-btn"
                onClick={() => setShowLanguageModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showMoodPicker && (
        <div className="mood-picker-overlay" onClick={() => setShowMoodPicker(false)}>
          <div className="mood-picker" onClick={(e) => e.stopPropagation()}>
            <div className="mood-picker-header">
              <h3>How are you feeling?</h3>
              <button className="mood-close-btn" onClick={() => setShowMoodPicker(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="mood-grid">
              {MOODS.map((mood) => {
                const { icon: Icon } = MOOD_DATA[mood];
                return (
                  <button
                    key={mood}
                    className="mood-button"
                    onClick={() => handleMoodSelect(mood)}
                    disabled={isLoadingRandom}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span>{mood}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">
          <div className="loading-spinner" />
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
