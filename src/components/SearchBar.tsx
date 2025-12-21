'use client';

import { useState, FormEvent } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

// Icon defined outside component
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="What do you want to listen to?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                />
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
