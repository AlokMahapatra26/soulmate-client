'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MusicProvider, useMusic } from '@/contexts/MusicContext';
import Link from 'next/link';
import Player from '@/components/Player';
import NowPlaying from '@/components/NowPlaying';
import Lyrics from '@/components/Lyrics';
import VideoPlayer from '@/components/VideoPlayer';

import { useTheme } from 'next-themes';
import { Sun, Moon, Home, ListMusic, Heart, History, Code, Shield, User, LogOut, Infinity } from 'lucide-react';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const music = useMusic();
    const { theme, setTheme } = useTheme();

    // Redirect unauthenticated users
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Not logged in at all - redirect to login
                router.replace('/login');
            } else if (user.status !== 'approved') {
                // Logged in but not approved - redirect to pending page
                router.replace('/pending');
            }
        }
    }, [user, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Don't render content until auth is confirmed
    if (!user || user.status !== 'approved') {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Redirecting...</p>
            </div>
        );
    }



    const isActive = (path: string) => pathname === path;

    return (
        <div className="app-wrapper">
            {/* Fixed Navbar */}
            <nav className="navbar fixed-navbar">
                <Link href="/app" className="navbar-logo">
                    <Infinity size={28} strokeWidth={2.5} />
                    <span>Soulmate</span>
                </Link>

                <div className="navbar-menu">
                    <Link
                        href="/app"
                        className={`navbar-link ${isActive('/app') ? 'active' : ''}`}
                    >
                        <Home size={18} />
                        <span>Home</span>
                    </Link>
                    <Link
                        href="/app/playlists"
                        className={`navbar-link ${isActive('/app/playlists') ? 'active' : ''}`}
                    >
                        <ListMusic size={18} />
                        <span>Playlists</span>
                    </Link>
                    <Link
                        href="/app/liked"
                        className={`navbar-link ${isActive('/app/liked') ? 'active' : ''}`}
                    >
                        <Heart size={18} />
                        <span>Liked</span>
                    </Link>
                    <Link
                        href="/app/history"
                        className={`navbar-link ${isActive('/app/history') ? 'active' : ''}`}
                    >
                        <History size={18} />
                        <span>History</span>
                    </Link>
                    <Link
                        href="/app/developer"
                        className={`navbar-link ${isActive('/app/developer') ? 'active' : ''}`}
                    >
                        <Code size={18} />
                        <span>Developer</span>
                    </Link>

                    {user?.role === 'admin' && (
                        <Link href="/admin" className="navbar-link admin">
                            <Shield size={18} />
                            <span>Admin</span>
                        </Link>
                    )}

                    <button
                        className="navbar-link"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        title="Toggle Theme"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="user-menu-container">
                        <button
                            className="user-menu-button"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <User size={20} />
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

            {/* Mobile Menu Popup */}
            {showMobileMenu && (
                <>
                    <div className="mobile-menu-backdrop" onClick={() => setShowMobileMenu(false)} />
                    <div className="mobile-menu-popup">
                        <Link href="/app/profile" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
                            <User size={18} />
                            <span>Profile</span>
                        </Link>
                        <Link href="/app/developer" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
                            <Code size={18} />
                            <span>Developer</span>
                        </Link>
                        <button className="mobile-menu-item danger" onClick={() => { logout(); router.push('/landing'); }}>
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </>
            )}

            {/* Mobile Bottom Navigation */}
            <div className="mobile-bottom-nav">
                <Link
                    href="/app"
                    className={`mobile-nav-item ${isActive('/app') ? 'active' : ''}`}
                >
                    <Home size={20} />
                    <span>Home</span>
                </Link>
                <Link
                    href="/app/playlists"
                    className={`mobile-nav-item ${isActive('/app/playlists') ? 'active' : ''}`}
                >
                    <ListMusic size={20} />
                    <span>Playlists</span>
                </Link>
                <Link
                    href="/app/liked"
                    className={`mobile-nav-item ${isActive('/app/liked') ? 'active' : ''}`}
                >
                    <Heart size={20} />
                    <span>Liked</span>
                </Link>
                <Link
                    href="/app/history"
                    className={`mobile-nav-item ${isActive('/app/history') ? 'active' : ''}`}
                >
                    <History size={20} />
                    <span>History</span>
                </Link>
                <button
                    className={`mobile-nav-item ${showMobileMenu ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    style={{ background: 'transparent', border: 'none', padding: 0 }}
                >
                    <User size={20} />
                    <span>Me</span>
                </button>
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
