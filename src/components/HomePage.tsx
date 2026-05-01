'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

/* ════════════════════════════════════════════
   Animated Stat Component
══════════════════════════════ */
function AnimatedStat({ target, duration, suffix, label }: { target: number; duration: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState('0' + suffix);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      if (suffix === 'K+' || suffix === '%') {
        if (target >= 1000) {
          const kVal = Math.round((eased * target) / 100) / 10;
          setValue(kVal.toFixed(target % 1000 === 0 ? 0 : 1) + suffix);
        } else {
          setValue((eased * target).toFixed(target % 1 === 0 ? 0 : 1) + suffix);
        }
      } else {
        const current = Math.round(eased * target);
        setValue(current.toLocaleString() + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration, suffix]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div className="toh-hero-stat" ref={ref}>
      <div className="toh-hero-stat-num">{value}</div>
      <div className="toh-hero-stat-label">{label}</div>
      <div className="toh-hero-stat-glow" />
    </div>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: '⚡',
      title: 'XP Tracking',
      desc: 'Real-time XP calculations with level progress tracking. Know exactly where you stand.',
      items: ['Automatic XP sync', 'Level milestones', 'Progress projections'],
    },
    {
      icon: '🎯',
      title: 'Grind Planner',
      desc: 'Plan your path to the top with intelligent grind calculations and time estimates.',
      items: ['Time-to-level estimates', 'Daily XP goals', 'Efficiency metrics'],
    },
    {
      icon: '🏁',
      title: 'Race Mode',
      desc: 'Compete head-to-head with other players in real-time tower climbing races.',
      items: ['Live race tracking', 'Auto point calculation', 'Race history'],
    },
    {
      icon: '🏆',
      title: 'Leaderboard',
      desc: 'Official community rankings updated in real-time. See who dominates the tower.',
      items: ['Top 300 players', 'Device filtering', 'Country tracking'],
    },
    {
      icon: '📊',
      title: 'Stat Comparison',
      desc: 'Compare your stats against any player. See how you measure up to the best.',
      items: ['Side-by-side compare', 'Level difference', 'Progress speed'],
    },
    {
      icon: '🤖',
      title: 'Discord Integration',
      desc: 'Seamless Discord bot experience with slash commands and rich embeds.',
      items: ['Slash commands', 'Rich embeds', 'Auto-updates'],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="toh-hero">
        <div className="toh-hero-glow" />
        <div className="toh-container">
          <div className="toh-hero-inner">
            <div>
              <div className="toh-hero-eyebrow">
                <span>🔥</span> Now with Race Mode
              </div>
              <h1 className="toh-hero-shimmer">
                The Ultimate{' '}
                <span>Tower of Hell</span>
                {' '}Bot
              </h1>
              <p className="toh-hero-desc">
                XP calculations, grind planning, competitive tools, and real-time race mode — everything you need to dominate the tower, right in your Discord server.
              </p>
              <div className="toh-hero-actions">
                <a
                  href="https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toh-btn-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  Add to Server
                </a>
                <button className="toh-btn-ghost" onClick={() => onNavigate('commands')}>
                  View Commands →
                </button>
                <button className="toh-btn-ghost toh-btn-leaderboard-cta" onClick={() => onNavigate('leaderboard')}>
                  <Trophy size={15} />
                  View Leaderboard
                </button>
              </div>
              <div className="toh-hero-stats">
                <AnimatedStat target={5000} duration={1500} suffix="K+" label="Servers" />
                <AnimatedStat target={50000} duration={1500} suffix="K+" label="Users" />
                <AnimatedStat target={99.9} duration={1500} suffix="%" label="Uptime" />
              </div>
            </div>

            {/* Discord Mockup */}
            <div className="toh-mockup toh-mockup-float">
              <div className="toh-mockup-bar">
                <div className="toh-mockup-dot" style={{ background: '#ff5f57' }} />
                <div className="toh-mockup-dot" style={{ background: '#febc2e' }} />
                <div className="toh-mockup-dot" style={{ background: '#28c840' }} />
              </div>
              <div className="toh-mockup-content">
                <div className="dc-msg">
                  <div className="dc-avatar" style={{ background: '#5865f2' }}>T</div>
                  <div className="dc-msg-body">
                    <div className="dc-author">
                      <span className="dc-name">TOH Bot</span>
                      <span className="dc-badge">BOT</span>
                      <span className="dc-time">Today at 4:20 PM</span>
                    </div>
                    <div className="dc-text">/level Skyourain</div>
                  </div>
                </div>
                <div className="dc-msg">
                  <div className="dc-avatar" style={{ background: '#5865f2' }}>T</div>
                  <div className="dc-msg-body">
                    <div className="dc-author">
                      <span className="dc-name">TOH Bot</span>
                      <span className="dc-badge">BOT</span>
                      <span className="dc-time">Today at 4:20 PM</span>
                    </div>
                    <div className="dc-embed">
                      <div className="dc-embed-title">📊 Player Stats — Skyourain</div>
                      <div className="dc-fields">
                        <div>
                          <div className="dc-field-name">Level</div>
                          <div className="dc-field-val">1,341</div>
                        </div>
                        <div>
                          <div className="dc-field-name">Rank</div>
                          <div className="dc-field-val">#1 🥇</div>
                        </div>
                        <div>
                          <div className="dc-field-name">Country</div>
                          <div className="dc-field-val">🇷🇺 Russia</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="toh-container">
          <div className="toh-section-header">
            <div className="toh-section-eyebrow">Features</div>
            <h2 className="toh-section-title">Everything You Need</h2>
            <p className="toh-section-subtitle">
              From XP tracking to live races — TOH Bot has every tool a Tower of Hell player needs.
            </p>
          </div>
          <div className="toh-features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="toh-feature-card toh-feature-card-stagger"
                style={{ animationDelay: `${i * 100}ms` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--spot-x', `${x}%`);
                  e.currentTarget.style.setProperty('--spot-y', `${y}%`);
                }}
              >
                <div className="toh-feature-icon">{f.icon}</div>
                <div className="toh-feature-title">{f.title}</div>
                <div className="toh-feature-desc">{f.desc}</div>
                <div className="toh-feature-items">
                  {f.items.map((item) => (
                    <div key={item} className="toh-feature-item">{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
