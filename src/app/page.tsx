'use client';

import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import CommandsPage from '@/components/CommandsPage';
import RaceModePage from '@/components/RaceModePage';
import LeaderboardPage from '@/components/LeaderboardPage';
import { Menu, X } from 'lucide-react';

type PageType = 'home' | 'commands' | 'race' | 'leaderboard';

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page as PageType);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks: { key: PageType; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'commands', label: 'Commands' },
    { key: 'race', label: 'Race Mode' },
    { key: 'leaderboard', label: 'Leaderboard' },
  ];

  return (
    <div className="toh-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav className={`toh-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="toh-nav-inner">
          <div className="toh-nav-logo" onClick={() => navigate('home')}>
            <div className="toh-nav-logo-icon">T</div>
            <span>TOH Bot</span>
          </div>

          <div className="toh-nav-links">
            {navLinks.map((link) => (
              <button
                key={link.key}
                className={`toh-nav-link ${currentPage === link.key ? 'active' : ''}`}
                onClick={() => navigate(link.key)}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="toh-nav-actions">
            <a
              href="https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="toh-btn-primary"
              style={{ fontSize: 13, padding: '7px 14px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Add to Server
            </a>
          </div>

          <button
            className="toh-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="toh-mobile-menu open" style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '12px 22px 16px',
            background: 'rgba(5, 5, 5, 0.95)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '0 0 999px 999px',
          }}>
            {navLinks.map((link) => (
              <button
                key={link.key}
                className={`toh-nav-link ${currentPage === link.key ? 'active' : ''}`}
                onClick={() => navigate(link.key)}
                style={{ padding: '10px 14px', width: '100%', textAlign: 'left' }}
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="toh-btn-primary"
              style={{ marginTop: 8, justifyContent: 'center', width: '100%' }}
            >
              Add to Server
            </a>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && <HomePage onNavigate={navigate} />}
        {currentPage === 'commands' && <CommandsPage />}
        {currentPage === 'race' && <RaceModePage />}
        {currentPage === 'leaderboard' && <LeaderboardPage />}
      </main>

      {/* Footer */}
      <footer className="toh-footer">
        <div className="toh-container">
          <p>
            © {new Date().getFullYear()} TOH Bot — Built for the{' '}
            <a href="https://www.roblox.com/games/1962086868" target="_blank" rel="noopener noreferrer">
              Tower of Hell
            </a>{' '}
            community.
          </p>
        </div>
      </footer>
    </div>
  );
}
