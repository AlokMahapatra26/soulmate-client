'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/app');
        } catch (err: any) {
            if (err.response?.data?.status === 'pending') {
                router.push('/pending');
            } else if (err.response?.data?.status === 'rejected') {
                setError('Your account has been rejected. Please contact support.');
            } else {
                setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-header">
                    <h1 className="auth-logo">
                        SOUL<span className="logo-accent">MATE</span>
                    </h1>
                    <p className="auth-subtitle">Sign in to continue</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Sign Up Link */}
                <div className="auth-footer">
                    <p>Don't have an account?{' '}
                        <Link href="/signup" className="auth-link">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Back to Landing */}
                <div className="auth-back">
                    <Link href="/landing" className="back-link">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
