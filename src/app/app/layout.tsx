'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MusicProvider, useMusic } from '@/contexts/MusicContext';
import Link from 'next/link';
import Player from '@/components/Player';
import NowPlaying from '@/components/NowPlaying';
import Lyrics from '@/components/Lyrics';
import VideoPlayer from '@/components/VideoPlayer';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const music = useMusic();

    const UserIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );

    const isActive = (path: string) => pathname === path;

    return (
        <div className="app-wrapper">
            {/* Fixed Navbar */}
            <nav className="navbar fixed-navbar">
                <Link href="/app" className="navbar-logo">
                    SOUL<span className="navbar-logo-accent">MATE</span>
                </Link>

                <div className="navbar-menu">
                    <Link
                        href="/app"
                        className={`navbar-link ${isActive('/app') ? 'active' : ''}`}
                    >
                        Player
                    </Link>
                    <Link
                        href="/app/playlists"
                        className={`navbar-link ${isActive('/app/playlists') ? 'active' : ''}`}
                    >
                        Playlists
                    </Link>
                    <Link
                        href="/app/liked"
                        className={`navbar-link ${isActive('/app/liked') ? 'active' : ''}`}
                    >
                        Liked
                    </Link>
                    <Link
                        href="/app/history"
                        className={`navbar-link ${isActive('/app/history') ? 'active' : ''}`}
                    >
                        History
                    </Link>
                    <Link
                        href="/app/developer"
                        className={`navbar-link ${isActive('/app/developer') ? 'active' : ''}`}
                    >
                        Developer
                    </Link>
                    {/* <Link
                        href="/app/friends"
                        className={`navbar-link ${isActive('/app/friends') ? 'active' : ''}`}
                    >
                        Friends
                    </Link> */}
                    {user?.role === 'admin' && (
                        <Link href="/admin" className="navbar-link admin">
                            Admin
                        </Link>
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
                                    <Link
                                        href="/app/profile"
                                        className="user-menu-item"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { logout(); router.push('/landing'); }}
                                        className="user-menu-item"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content Area with Sidebars */}
            <div className="app-main-wrapper">
                <div className={`app-layout ${music.showExpandedLyrics ? 'lyrics-expanded' : ''}`}>
                    {/* Left Sidebar - Now Playing & Queue */}
                    <aside className="sidebar-left">
                        <NowPlaying
                            track={music.currentTrack}
                            queue={music.queue}
                            onQueueItemClick={music.playTrack}
                            onQueueItemRemove={music.removeFromQueue}
                        />
                    </aside>

                    {/* Center - Page Content (hidden when lyrics expanded) */}
                    {!music.showExpandedLyrics && (
                        <main className="main-content">
                            {music.showVideo && music.currentTrack ? (
                                <VideoPlayer />
                            ) : (
                                children
                            )}
                        </main>
                    )}

                    {/* Right Sidebar - Lyrics */}
                    <aside className={`sidebar-right ${music.showExpandedLyrics ? 'expanded' : ''}`}>
                        <Lyrics
                            track={music.currentTrack}
                            currentTime={music.currentTime}
                            isVisible={true}
                            onClose={() => { }}
                        />
                    </aside>
                </div>

                {/* Bottom Player */}
                <Player
                    track={music.currentTrack}
                    onNext={music.playNext}
                    onPrevious={music.playPrevious}
                    onTimeUpdate={music.setCurrentTime}
                    onAudioReady={music.setAudioElement}
                    onPlayingStateChange={music.setIsPlaying}
                />
            </div>
        </div>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <MusicProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
        </MusicProvider>
    );
}
