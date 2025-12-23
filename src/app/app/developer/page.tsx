'use client';

import { Github, Linkedin, Twitter, Instagram, Coffee, ExternalLink, Copy, Send, Lightbulb, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFeedback, submitFeedback, Feedback, getSupporters, Supporter } from '@/lib/api';

type TabType = 'supporters' | 'suggestion' | 'thankyou';

export default function DeveloperPage() {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('supporters');
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const upiId = '8849561649@upi';

    const copyUPI = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'supporters') {
                const data = await getSupporters();
                setSupporters(data);
            } else {
                const data = await getFeedback(activeTab);
                setFeedbackList(data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim() || activeTab === 'supporters') return;

        setSubmitting(true);
        try {
            await submitFeedback({ type: activeTab, name: name.trim(), message: message.trim() });
            setName('');
            setMessage('');
            loadData();
        } catch (error) {
            console.error('Failed to submit:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="developer-page">
            {/* Profile */}
            <section className="profile">
                <div className="avatar">
                    <img src="https://pbs.twimg.com/profile_images/1789694582051221504/EWt7z5dz_400x400.jpg" alt="Alok" />
                </div>
                <h1>Alok Mahapatra</h1>
                <p className="tagline">Developer of SoulMate</p>
            </section>

            {/* Social Links */}
            <section className="socials">
                <a href="https://github.com/AlokMahapatra26" target="_blank" rel="noopener noreferrer" title="GitHub">
                    <Github size={18} />
                </a>
                <a href="https://www.linkedin.com/in/alok-mahapatra/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                    <Linkedin size={18} />
                </a>
                <a href="https://x.com/aloktwts" target="_blank" rel="noopener noreferrer" title="Twitter">
                    <Twitter size={18} />
                </a>
                <a href="https://www.instagram.com/alok.torrent/" target="_blank" rel="noopener noreferrer" title="Instagram">
                    <Instagram size={18} />
                </a>
            </section>

            {/* Support */}
            <section className="support">
                <h2>Support</h2>
                <a href="https://buymeacoffee.com/alokmahapatra" target="_blank" rel="noopener noreferrer" className="bmc-btn">
                    <Coffee size={18} />
                    Buy me a coffee
                    <ExternalLink size={14} />
                </a>
                <div className="upi-section">
                    <p className="upi-label">Or pay via UPI</p>
                    <button className="upi-id" onClick={copyUPI}>
                        <span>{upiId}</span>
                        <Copy size={14} />
                        {copied && <span className="copied-toast">Copied!</span>}
                    </button>
                </div>
            </section>

            {/* Forum Section */}
            <section className="forum">
                <div className="forum-tabs">
                    <button
                        className={`tab ${activeTab === 'supporters' ? 'active' : ''}`}
                        onClick={() => setActiveTab('supporters')}
                    >
                        <Star size={16} />
                        Supporters
                    </button>
                    <button
                        className={`tab ${activeTab === 'suggestion' ? 'active' : ''}`}
                        onClick={() => setActiveTab('suggestion')}
                    >
                        <Lightbulb size={16} />
                        Suggestions
                    </button>
                    <button
                        className={`tab ${activeTab === 'thankyou' ? 'active' : ''}`}
                        onClick={() => setActiveTab('thankyou')}
                    >
                        <Heart size={16} />
                        Thank You
                    </button>
                </div>

                {/* Submit Form (only for suggestions/thankyou) */}
                {activeTab !== 'supporters' && (
                    <form className="submit-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                        />
                        <textarea
                            placeholder={activeTab === 'suggestion' ? "Share your feature idea..." : "Say thank you or share feedback..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={1000}
                            rows={3}
                        />
                        <button type="submit" disabled={submitting || !name.trim() || !message.trim()}>
                            <Send size={16} />
                            {submitting ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                )}

                {/* Content List */}
                <div className="feedback-list">
                    {loading ? (
                        <p className="empty">Loading...</p>
                    ) : activeTab === 'supporters' ? (
                        supporters.length === 0 ? (
                            <p className="empty">No supporters yet</p>
                        ) : (
                            supporters.map((item) => (
                                <div key={item.id} className="feedback-item supporter-item">
                                    <div className="feedback-header">
                                        <span className="feedback-name">
                                            <Star size={14} className="star-icon" />
                                            {item.name}
                                        </span>
                                        {item.amount && <span className="supporter-amount">{item.amount}</span>}
                                    </div>
                                    {item.message && <p className="feedback-message">{item.message}</p>}
                                </div>
                            ))
                        )
                    ) : feedbackList.length === 0 ? (
                        <p className="empty">No {activeTab === 'suggestion' ? 'suggestions' : 'messages'} yet. Be the first!</p>
                    ) : (
                        feedbackList.map((item) => (
                            <div key={item.id} className="feedback-item">
                                <div className="feedback-header">
                                    <span className="feedback-name">{item.name}</span>
                                    <span className="feedback-date">{formatDate(item.createdAt)}</span>
                                </div>
                                <p className="feedback-message">{item.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <style jsx>{`
                .developer-page {
                    height: 100%;
                    overflow-y: auto;
                    padding: 48px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 32px;
                }

                .profile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid var(--white-10);
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .profile h1 {
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--white);
                    margin: 0;
                }

                .tagline {
                    font-size: 14px;
                    color: var(--white-50);
                    margin: 0;
                }

                .socials {
                    display: flex;
                    gap: 12px;
                }

                .socials a {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--white-5);
                    border: 1px solid var(--white-10);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--white-60);
                    transition: all 0.2s;
                }

                .socials a:hover {
                    background: var(--white-10);
                    color: var(--white);
                    transform: translateY(-2px);
                }

                .support {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    width: 100%;
                    max-width: 280px;
                }

                .support h2 {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--white-40);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0;
                }

                .bmc-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: #FFDD00;
                    color: #000;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                    width: 100%;
                    justify-content: center;
                }

                .bmc-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(255, 221, 0, 0.2);
                }

                .upi-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .upi-label {
                    font-size: 12px;
                    color: var(--white-40);
                    margin: 0;
                }

                .upi-id {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    background: var(--white-5);
                    border: 1px solid var(--white-10);
                    border-radius: 8px;
                    color: var(--white-70);
                    font-family: monospace;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .upi-id:hover {
                    background: var(--white-10);
                    color: var(--white);
                }

                .copied-toast {
                    position: absolute;
                    top: -28px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #22c55e;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-family: var(--font);
                }

                .forum {
                    width: 100%;
                    max-width: 500px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding-top: 24px;
                    border-top: 1px solid var(--white-10);
                }

                .forum-tabs {
                    display: flex;
                    gap: 6px;
                }

                .tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 8px;
                    background: var(--white-5);
                    border: 1px solid var(--white-10);
                    border-radius: 8px;
                    color: var(--white-60);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tab:hover {
                    background: var(--white-10);
                }

                .tab.active {
                    background: var(--red-dim, rgba(255, 0, 80, 0.1));
                    border-color: var(--red);
                    color: var(--red);
                }

                .submit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .submit-form input,
                .submit-form textarea {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--white-5);
                    border: 1px solid var(--white-10);
                    border-radius: 8px;
                    color: var(--white);
                    font-size: 14px;
                    font-family: var(--font);
                    resize: none;
                }

                .submit-form input::placeholder,
                .submit-form textarea::placeholder {
                    color: var(--white-40);
                }

                .submit-form input:focus,
                .submit-form textarea:focus {
                    outline: none;
                    border-color: var(--white-20);
                }

                .submit-form button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px;
                    background: var(--red);
                    border: none;
                    border-radius: 8px;
                    color: var(--white);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .submit-form button:hover:not(:disabled) {
                    opacity: 0.9;
                }

                .submit-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .feedback-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .empty {
                    text-align: center;
                    color: var(--white-40);
                    font-size: 14px;
                    padding: 24px;
                }

                .feedback-item {
                    padding: 12px;
                    background: var(--white-5);
                    border: 1px solid var(--white-10);
                    border-radius: 8px;
                }

                .supporter-item {
                    border-color: #ffd7002a;
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), transparent);
                }

                .feedback-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .feedback-name {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--white);
                }

                .star-icon {
                    color: #ffd700;
                }

                .supporter-amount {
                    font-size: 12px;
                    color: #ffd700;
                    font-weight: 600;
                }

                .feedback-date {
                    font-size: 11px;
                    color: var(--white-40);
                }

                .feedback-message {
                    font-size: 13px;
                    color: var(--white-70);
                    line-height: 1.5;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
