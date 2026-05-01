'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import HomePage from '@/components/HomePage';
import CommandsPage from '@/components/CommandsPage';
import RaceModePage from '@/components/RaceModePage';
import LeaderboardPage from '@/components/LeaderboardPage';
import { Menu, X, ArrowUp, MessageCircle, Github, Sun, Moon, Keyboard, Bell, ChevronRight, ArrowLeft } from 'lucide-react';

type PageType = 'home' | 'commands' | 'race' | 'leaderboard';
type NavigateDirection = 'forward' | 'back';

const VALID_PAGES: PageType[] = ['home', 'commands', 'race', 'leaderboard'];

const PAGE_INDEX: Record<PageType, number> = { home: 0, commands: 1, race: 2, leaderboard: 3 };

const PAGE_META: Record<PageType, { emoji: string; label: string }> = {
  home: { emoji: '🏠', label: 'Home' },
  commands: { emoji: '⌨️', label: 'Commands' },
  race: { emoji: '🏁', label: 'Race Mode' },
  leaderboard: { emoji: '🏆', label: 'Leaderboard' },
};

interface Notification {
  id: number;
  emoji: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, emoji: '🏆', title: 'New #1 Player', desc: 'Skyourain reached Level 1,341!', time: '2m ago', unread: true },
  { id: 2, emoji: '🏁', title: 'Race Completed', desc: 'wilder270522 won a race', time: '15m ago', unread: true },
  { id: 3, emoji: '📊', title: 'Leaderboard Update', desc: '300 players now tracked', time: '1h ago', unread: false },
  { id: 4, emoji: '⚡', title: 'New Milestone', desc: 'chatgris31 hit Level 900!', time: '3h ago', unread: false },
  { id: 5, emoji: '🤖', title: 'Bot Update', desc: 'v2.4 Race Mode is live!', time: '1d ago', unread: false },
];

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
   Page Transition Wrapper (with directional slide)
══════════════════════════════ */
function PageTransition({
  children,
  pageKey,
  direction,
}: {
  children: React.ReactNode;
  pageKey: string;
  direction: NavigateDirection;
}) {
  const [visible, setVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentKey, setCurrentKey] = useState(pageKey);
  const [animDirection, setAnimDirection] = useState<NavigateDirection>(direction);

  useEffect(() => {
    if (pageKey !== currentKey) {
      queueMicrotask(() => setAnimDirection(direction));
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
  }, [pageKey, currentKey, children, direction]);

  const slideX = animDirection === 'forward' ? 40 : -40;

  return (
    <div
      className="toh-page-transition-wrapper"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0) translateY(0)' : `translateX(${slideX}px) translateY(8px)`,
        transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
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
  const [showKbHelp, setShowKbHelp] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [navigateDirection, setNavigateDirection] = useState<NavigateDirection>('forward');

  const notifRef = useRef<HTMLDivElement>(null);
  const pageHistoryRef = useRef<PageType[]>(['home']);

  // Scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const viewHeight = window.innerHeight;
      const maxScroll = docHeight - viewHeight;
      const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Cookie consent: check localStorage on mount
  useEffect(() => {
    const consent = localStorage.getItem('toh-cookie-consent');
    if (!consent) {
      queueMicrotask(() => setShowCookieBanner(true));
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
        const target = hash as PageType;
        setCurrentPage((prev) => {
          if (prev !== target) {
            const prevIdx = PAGE_INDEX[prev];
            const nextIdx = PAGE_INDEX[target];
            setNavigateDirection(nextIdx > prevIdx ? 'forward' : 'back');
            pageHistoryRef.current = [...pageHistoryRef.current, target];
          }
          return target;
        });
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
    const target = page as PageType;
    setCurrentPage((prev) => {
      if (prev !== target) {
        const prevIdx = PAGE_INDEX[prev];
        const nextIdx = PAGE_INDEX[target];
        setNavigateDirection(nextIdx > prevIdx ? 'forward' : 'back');
        pageHistoryRef.current = [...pageHistoryRef.current, target];
      }
      return target;
    });
    setMobileMenuOpen(false);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    const history = pageHistoryRef.current;
    if (history.length <= 1) {
      navigate('home');
      return;
    }
    // Remove current page from history
    history.pop();
    const prevPage = history[history.length - 1];
    setNavigateDirection('back');
    setCurrentPage(prevPage);
    setMobileMenuOpen(false);
    window.location.hash = prevPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Keyboard shortcuts: 1-4 for page navigation, Escape closes mobile menu, ? toggles help, / focuses search, Alt+Left goes back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      // Alt+Left arrow: go back in page history
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const keyMap: Record<string, PageType> = { '1': 'home', '2': 'commands', '3': 'race', '4': 'leaderboard' };
      if (keyMap[e.key]) {
        e.preventDefault();
        navigate(keyMap[e.key]);
      }
      if (e.key === 'Escape') {
        if (showKbHelp) {
          setShowKbHelp(false);
        } else if (showNotifications) {
          setShowNotifications(false);
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
      if (e.key === '?') {
        e.preventDefault();
        setShowKbHelp((prev) => !prev);
      }
      if (e.key === '/') {
        e.preventDefault();
        if (currentPage === 'commands' || currentPage === 'leaderboard') {
          window.dispatchEvent(new CustomEvent('toh-focus-search'));
        } else {
          setShowKbHelp((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, goBack, mobileMenuOpen, showKbHelp, showNotifications, currentPage]);

  // Notification handlers
  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Cookie consent handlers
  const acceptCookies = useCallback(() => {
    localStorage.setItem('toh-cookie-consent', 'accepted');
    setShowCookieBanner(false);
  }, []);

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

      {/* Scroll Progress Indicator */}
      <div
        className="toh-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      />

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
            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                className="toh-notif-btn"
                onClick={() => setShowNotifications((v) => !v)}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="toh-notif-badge">{unreadCount}</span>}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="toh-notif-dropdown">
                  <div className="toh-notif-header">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button className="toh-notif-mark-all" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="toh-notif-list">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        className={`toh-notif-item ${notif.unread ? 'toh-notif-item-unread' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <span className="toh-notif-item-emoji">{notif.emoji}</span>
                        <div className="toh-notif-item-content">
                          <div className="toh-notif-item-title">{notif.title}</div>
                          <div className="toh-notif-item-desc">{notif.desc}</div>
                        </div>
                        <span className="toh-notif-item-time">{notif.time}</span>
                        {notif.unread && <span className="toh-notif-item-dot" />}
                      </button>
                    ))}
                  </div>
                  <div className="toh-notif-footer">
                    <span className="toh-notif-footer-text">That&apos;s all for now!</span>
                  </div>
                </div>
              )}
            </div>

            <button
              className="toh-kb-toggle toh-theme-toggle"
              onClick={() => setShowKbHelp((v) => !v)}
              aria-label="Toggle keyboard shortcuts help"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard size={18} />
            </button>
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

        {/* Mobile menu - always rendered, CSS transition controls visibility */}
        <div className={`toh-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <button
              key={link.key}
              className={`toh-nav-link ${currentPage === link.key ? 'active' : ''}`}
              onClick={() => navigate(link.key)}
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
      </nav>

      {/* Breadcrumb Navigation Bar */}
      <div className="toh-breadcrumb-bar">
        <div className="toh-container">
          <div className="toh-breadcrumb-inner">
            {/* Back button */}
            {currentPage !== 'home' ? (
              <button
                className="toh-breadcrumb-back"
                onClick={goBack}
                aria-label="Go back to previous page"
                title="Go back"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <span className="toh-breadcrumb-back toh-breadcrumb-back-hidden">
                <ArrowLeft size={14} />
                <span>Back</span>
              </span>
            )}

            <div className="toh-breadcrumb-separator-v" />

            {/* Breadcrumb trail */}
            <nav className="toh-breadcrumb-trail" aria-label="Breadcrumb">
              <button
                className="toh-breadcrumb-item"
                onClick={() => navigate('home')}
              >
                <span className="toh-breadcrumb-item-emoji">🏠</span>
                <span className="toh-breadcrumb-item-text">Home</span>
                <span className="toh-breadcrumb-underline" />
              </button>

              {currentPage !== 'home' && (
                <>
                  <ChevronRight size={12} className="toh-breadcrumb-chevron" />
                  <span className="toh-breadcrumb-item toh-breadcrumb-item-active">
                    <span className="toh-breadcrumb-item-emoji">{PAGE_META[currentPage].emoji}</span>
                    <span className="toh-breadcrumb-item-text">{PAGE_META[currentPage].label}</span>
                    <span className="toh-breadcrumb-underline" />
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Page Content with Transitions */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <PageTransition pageKey={currentPage} direction={navigateDirection}>
          {currentPage === 'home' && <HomePage onNavigate={navigate} />}
          {currentPage === 'commands' && <CommandsPage />}
          {currentPage === 'race' && <RaceModePage />}
          {currentPage === 'leaderboard' && <LeaderboardPage />}
        </PageTransition>
      </main>

      {/* Footer */}
      <footer className="toh-footer toh-footer-enhanced" style={{ position: 'relative', zIndex: 1 }}>
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
              <div className="toh-footer-newsletter">
                <input
                  type="email"
                  className="toh-footer-newsletter-input"
                  placeholder="Stay updated — enter email"
                  aria-label="Email for newsletter"
                />
                <button className="toh-footer-newsletter-btn">Subscribe</button>
              </div>
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
              &copy; {new Date().getFullYear()} TOH Bot &mdash; Built for the{' '}
              <a href="https://www.roblox.com/games/1962086868" target="_blank" rel="noopener noreferrer">
                Tower of Hell
              </a>{' '}
              community.
            </p>
            <p className="toh-footer-love">Made with ❤️ &middot; Powered by Next.js</p>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Help Panel */}
      {showKbHelp && (
        <div className="toh-kb-overlay" onClick={() => setShowKbHelp(false)}>
          <div className="toh-kb-card" onClick={(e) => e.stopPropagation()}>
            <div className="toh-kb-header">
              <div className="toh-kb-header-icon">
                <Keyboard size={20} />
              </div>
              <h2 className="toh-kb-title">Keyboard Shortcuts</h2>
              <button className="toh-kb-close" onClick={() => setShowKbHelp(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="toh-kb-list">
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">1</kbd></div>
                <div className="toh-kb-desc">Navigate to Home</div>
              </div>
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">2</kbd></div>
                <div className="toh-kb-desc">Navigate to Commands</div>
              </div>
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">3</kbd></div>
                <div className="toh-kb-desc">Navigate to Race Mode</div>
              </div>
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">4</kbd></div>
                <div className="toh-kb-desc">Navigate to Leaderboard</div>
              </div>
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">/</kbd></div>
                <div className="toh-kb-desc">Focus search (Commands &amp; Leaderboard)</div>
              </div>
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">Alt</kbd><span className="toh-kb-plus">+</span><kbd className="toh-kb-key">&larr;</kbd></div>
                <div className="toh-kb-desc">Go back to previous page</div>
              </div>
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">Esc</kbd></div>
                <div className="toh-kb-desc">Close menu / panel</div>
              </div>
              <div className="toh-kb-row">
                <div className="toh-kb-keys"><kbd className="toh-kb-key">?</kbd></div>
                <div className="toh-kb-desc">Toggle this panel</div>
              </div>
            </div>
            <div className="toh-kb-footer">
              Press <kbd className="toh-kb-key toh-kb-key-sm">?</kbd> or <kbd className="toh-kb-key toh-kb-key-sm">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="toh-cookie-banner">
          <div className="toh-cookie-content">
            <p className="toh-cookie-text">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
            </p>
            <div className="toh-cookie-actions">
              <a
                href="https://www.cookiesandyou.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="toh-cookie-learn"
              >
                Learn More
              </a>
              <button className="toh-cookie-accept" onClick={acceptCookies}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}
