'use client';

import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';

export type SearchType = 'music' | 'video';

interface SearchBarProps {
    onSearch: (query: string, searchType: SearchType) => void;
    isLoading: boolean;
    onClear?: () => void;
}

// Icons defined outside component
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const MusicIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const PodcastIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

export default function SearchBar({ onSearch, isLoading, onClear }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('music');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim(), searchType);
        }
    };

    const handleClear = () => {
        setQuery('');
        if (onClear) {
            onClear();
        }
    };

    return (
        <div className="search-container">
            <div className="search-filter-buttons">
                <button
                    type="button"
                    className={`filter-button ${searchType === 'music' ? 'active' : ''}`}
                    onClick={() => setSearchType('music')}
                    disabled={isLoading}
                >
                    <MusicIcon />
                    <span>Music</span>
                </button>
                <button
                    type="button"
                    className={`filter-button ${searchType === 'video' ? 'active' : ''}`}
                    onClick={() => setSearchType('video')}
                    disabled={isLoading}
                >
                    <PodcastIcon />
                    <span>Podcasts</span>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="search-wrapper">
                <div className="search-input-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder={searchType === 'music' ? "Search for songs..." : "Search for podcasts..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    {(query || onClear) && (
                        <button
                            type="button"
                            className="search-clear-button"
                            onClick={handleClear}
                            aria-label="Clear search"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
                <button
                    type="submit"
                    className="search-button"
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? (
                        'Searching...'
                    ) : (
                        <>
                            <SearchIcon />
                            <span style={{ marginLeft: '6px' }}>Search</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
