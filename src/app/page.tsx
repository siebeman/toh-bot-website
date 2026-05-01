'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import HomePage from '@/components/HomePage';
import CommandsPage from '@/components/CommandsPage';
import RaceModePage from '@/components/RaceModePage';
import LeaderboardPage from '@/components/LeaderboardPage';
import { Menu, X, ArrowUp, MessageCircle, Github, Sun, Moon } from 'lucide-react';

type PageType = 'home' | 'commands' | 'race' | 'leaderboard';

const VALID_PAGES: PageType[] = ['home', 'commands', 'race', 'leaderboard'];

/* ════════════════════════════════════════════
   Background Particles Canvas
══════════════════════════════ */
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; o: number; hue: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.25 + 0.1,
        hue: Math.random() > 0.5 ? 250 + Math.random() * 30 : 0,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.hue > 0) {
          ctx.fillStyle = `hsla(${p.hue}, 60%, 75%, ${p.o})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.o * 0.6})`;
        }
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        if (p.hue > 0) {
          ctx.fillStyle = `hsla(${p.hue}, 60%, 75%, ${p.o * 0.15})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.o * 0.08})`;
        }
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ════════════════════════════════════════════
   Page Transition Wrapper
══════════════════════════════ */
function PageTransition({ children, pageKey }: { children: React.ReactNode; pageKey: string }) {
  const [visible, setVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentKey, setCurrentKey] = useState(pageKey);

  useEffect(() => {
    if (pageKey !== currentKey) {
      const hideTimer = setTimeout(() => setVisible(false), 0);
      const showTimer = setTimeout(() => {
        setDisplayChildren(children);
        setCurrentKey(pageKey);
        setVisible(true);
      }, 150);
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
      };
    } else {
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [pageKey, currentKey, children]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      {displayChildren}
    </div>
  );
}

/* ════════════════════════════════════════════
   Scroll-to-Top Button
══════════════════════════════ */
function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="toh-scroll-top"
      aria-label="Scroll to top"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      <ArrowUp size={18} />
    </button>
  );
}

/* ════════════════════════════════════════════
   Main Page Component
══════════════════════════════ */
export default function MainPage() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

  // Theme: read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('toh-theme');
    if (stored === 'light') {
      queueMicrotask(() => setIsLight(true));
      document.documentElement.classList.add('light');
    } else {
      queueMicrotask(() => setIsLight(false));
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsLight((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('light');
        localStorage.setItem('toh-theme', 'light');
      } else {
        document.documentElement.classList.remove('light');
        localStorage.setItem('toh-theme', 'dark');
      }
      return next;
    });
  }, []);

  // Hash-based routing: read hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && VALID_PAGES.includes(hash as PageType)) {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setCurrentPage(hash as PageType));
    }
  }, []);

  // Listen for hashchange (back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && VALID_PAGES.includes(hash as PageType)) {
        setCurrentPage(hash as PageType);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useCallback((page: string) => {
    setCurrentPage(page as PageType);
    setMobileMenuOpen(false);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keyboard shortcuts: 1-4 for page navigation, Escape closes mobile menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const keyMap: Record<string, PageType> = { '1': 'home', '2': 'commands', '3': 'race', '4': 'leaderboard' };
      if (keyMap[e.key]) {
        e.preventDefault();
        navigate(keyMap[e.key]);
      }
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, mobileMenuOpen]);

  const navLinks: { key: PageType; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'commands', label: 'Commands' },
    { key: 'race', label: 'Race Mode' },
    { key: 'leaderboard', label: 'Leaderboard' },
  ];

  return (
    <div className="toh-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Particles */}
      <ParticlesCanvas />

      {/* Navigation */}
      <nav className={`toh-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="toh-nav-inner">
          <div className="toh-nav-logo" onClick={() => navigate('home')}>
            <div className="toh-nav-logo-icon">T</div>
            <span>TOH Bot</span>
          </div>

          <div className="toh-nav-links">
            {navLinks.map((link, idx) => (
              <button
                key={link.key}
                className={`toh-nav-link ${currentPage === link.key ? 'active' : ''}`}
                onClick={() => navigate(link.key)}
                title={`Navigate to ${link.label} (${idx + 1})`}
              >
                {link.label}
                <span className="toh-nav-shortcut">{idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="toh-nav-actions">
            <button
              className="toh-theme-toggle"
              onClick={toggleTheme}
              aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
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
            <button
              className="toh-theme-toggle"
              onClick={toggleTheme}
              aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
              style={{ margin: '0 auto' }}
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        )}
      </nav>

      {/* Page Content with Transitions */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <PageTransition pageKey={currentPage}>
          {currentPage === 'home' && <HomePage onNavigate={navigate} />}
          {currentPage === 'commands' && <CommandsPage />}
          {currentPage === 'race' && <RaceModePage />}
          {currentPage === 'leaderboard' && <LeaderboardPage />}
        </PageTransition>
      </main>

      {/* Footer */}
      <footer className="toh-footer" style={{ position: 'relative', zIndex: 1 }}>
        <div className="toh-container">
          <div className="toh-footer-grid">
            {/* Branding Column */}
            <div className="toh-footer-col toh-footer-brand">
              <div className="toh-footer-logo">
                <div className="toh-footer-logo-icon">T</div>
                <span className="toh-footer-logo-text">TOH Bot</span>
              </div>
              <p className="toh-footer-desc">
                The ultimate Discord bot for the Tower of Hell community. Track leaderboards, race friends, and climb the ranks.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="toh-footer-col">
              <h3 className="toh-footer-col-title">Quick Links</h3>
              <ul className="toh-footer-links-list">
                <li><button onClick={() => navigate('home')} className="toh-footer-link">Home</button></li>
                <li><button onClick={() => navigate('commands')} className="toh-footer-link">Commands</button></li>
                <li><button onClick={() => navigate('race')} className="toh-footer-link">Race Mode</button></li>
                <li><button onClick={() => navigate('leaderboard')} className="toh-footer-link">Leaderboard</button></li>
              </ul>
            </div>

            {/* Community Column */}
            <div className="toh-footer-col">
              <h3 className="toh-footer-col-title">Community</h3>
              <ul className="toh-footer-links-list">
                <li>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="toh-footer-link toh-footer-link-external">
                    <MessageCircle size={14} />
                    Discord
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="toh-footer-link toh-footer-link-external">
                    <Github size={14} />
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID" target="_blank" rel="noopener noreferrer" className="toh-footer-link toh-footer-link-external">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Add to Server
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="toh-footer-bottom">
            <p className="toh-footer-copy">
              © {new Date().getFullYear()} TOH Bot — Built for the{' '}
              <a href="https://www.roblox.com/games/1962086868" target="_blank" rel="noopener noreferrer">
                Tower of Hell
              </a>{' '}
              community.
            </p>
            <p className="toh-footer-love">Made with ❤️ · Powered by Next.js</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}
