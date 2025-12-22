'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/app');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="landing-container">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="landing-container">
            <div className="landing-content">
                {/* Logo/Brand */}
                <div className="landing-brand">
                    <h1 className="landing-logo">
                        SOUL<span className="logo-accent">MATE</span>
                    </h1>
                    <p className="landing-tagline">Your Premium Music Companion</p>
                </div>

                {/* Features */}
                <div className="landing-features">
                    <div className="feature-card">
                        <div className="feature-icon">🎵</div>
                        <h3>Stream Millions of Songs</h3>
                        <p>Access a vast library of music from around the world</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Synced Lyrics</h3>
                        <p>Sing along with real-time synchronized lyrics</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">💾</div>
                        <h3>Create Playlists</h3>
                        <p>Organize your favorite tracks into custom playlists</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Connect with Friends</h3>
                        <p>Share your musical journey with friends</p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="landing-cta">
                    <button
                        className="cta-button cta-primary"
                        onClick={() => router.push('/login')}
                    >
                        Sign In
                    </button>
                    <button
                        className="cta-button cta-secondary"
                        onClick={() => router.push('/signup')}
                    >
                        Create Account
                    </button>
                </div>

                {/* Footer */}
                <div className="landing-footer">
                    <p>Premium minimal music player</p>
                </div>
            </div>
        </div>
    );
}
