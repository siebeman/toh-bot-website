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

/* ════════════════════════════════════════════
   FAQ Accordion Item
══════════════════════════════ */
function FAQItem({ question, answer, delay }: { question: string; answer: string; delay: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`toh-faq-item ${open ? 'open' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button className="toh-faq-question" onClick={() => setOpen((v) => !v)}>
        <span>{question}</span>
        <span className={`toh-faq-chevron ${open ? 'expanded' : ''}`}>▸</span>
      </button>
      <div className={`toh-faq-answer-wrap ${open ? 'expanded' : 'collapsed'}`}>
        <div className="toh-faq-answer">{answer}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Scroll Reveal Hook
══════════════════════════════ */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('toh-revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ════════════════════════════════════════════
   Changelog Data
══════════════════════════════ */
const CHANGELOG = [
  {
    version: 'v2.4',
    date: 'Apr 2026',
    title: 'Interactive Race Mode',
    desc: 'Compete in real-time tower climbing races with countdown, live tracking, and race history.',
    tags: ['New Feature', 'Race'],
  },
  {
    version: 'v2.3',
    date: 'Mar 2026',
    title: 'Player Comparison Tool',
    desc: 'Compare any two players side-by-side with level gaps, rank advantages, and detailed stats.',
    tags: ['New Feature', 'Leaderboard'],
  },
  {
    version: 'v2.2',
    date: 'Feb 2026',
    title: 'Country Distribution',
    desc: 'See where players are from with interactive country distribution charts and rankings.',
    tags: ['Improved', 'Leaderboard'],
  },
  {
    version: 'v2.1',
    date: 'Jan 2026',
    title: 'CSV Export & Data Tools',
    desc: 'Export leaderboard data as CSV, share player profiles, and access advanced filtering.',
    tags: ['New Feature', 'Tools'],
  },
  {
    version: 'v2.0',
    date: 'Dec 2025',
    title: 'Complete Redesign',
    desc: 'A full visual overhaul with glassmorphism, animated backgrounds, and improved navigation.',
    tags: ['Improved', 'Design'],
  },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const statsRevealRef = useScrollReveal();
  const featuresRevealRef = useScrollReveal();
  const changelogRevealRef = useScrollReveal();
  const faqRevealRef = useScrollReveal();
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

      {/* Community Stats Section */}
      <section className="toh-stats-section toh-reveal" ref={statsRevealRef}>
        <div className="toh-stats-glow" />
        <div className="toh-container">
          <div className="toh-section-header">
            <div className="toh-section-eyebrow">By The Numbers</div>
            <h2 className="toh-section-title">Community Stats</h2>
            <p className="toh-section-subtitle">
              Real metrics from our thriving Tower of Hell community — see the scale of the competition.
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className="toh-stats-grid">
            {[
              { icon: '👥', target: 300, duration: 1800, suffix: '', label: 'Total Players', sparkle: true },
              { icon: '📊', target: 305, duration: 1800, suffix: '', label: 'Average Level', sparkle: true },
              { icon: '🌍', target: 50, duration: 1500, suffix: '+', label: 'Countries Represented', sparkle: true },
              { icon: '🏆', target: 1341, duration: 2200, suffix: '', label: 'Top Level', sparkle: true },
              { icon: '🏁', target: 4, duration: 1200, suffix: '', label: 'Active Racers', sparkle: true },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="toh-stats-card toh-stats-card-stagger"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="toh-stats-card-glow" />
                <div className="toh-stats-icon">{stat.icon}</div>
                <div className="toh-stats-num">
                  <AnimatedStat target={stat.target} duration={stat.duration} suffix={stat.suffix} label={stat.label} />
                </div>
                <div className="toh-stats-sparkle toh-stats-sparkle-1" />
                <div className="toh-stats-sparkle toh-stats-sparkle-2" />
                <div className="toh-stats-sparkle toh-stats-sparkle-3" />
              </div>
            ))}
          </div>

          {/* Level Distribution Chart */}
          <div className="toh-stats-chart-wrap">
            <div className="toh-stats-chart-title">Level Distribution</div>
            <div className="toh-stats-chart-subtitle">How players are distributed across level ranges</div>
            <div className="toh-stats-chart">
              {[
                { range: '0–200', count: 68, pct: 22.7, color: 'var(--indigo)' },
                { range: '200–400', count: 82, pct: 27.3, color: '#7c6ed6' },
                { range: '400–600', count: 64, pct: 21.3, color: '#6f63db' },
                { range: '600–800', count: 42, pct: 14.0, color: 'var(--violet)' },
                { range: '800–1000', count: 28, pct: 9.3, color: '#a78bfa' },
                { range: '1000+', count: 16, pct: 5.3, color: '#c4b5fd' },
              ].map((bar, i) => (
                <div key={bar.range} className="toh-stats-bar-row">
                  <div className="toh-stats-bar-label">{bar.range}</div>
                  <div className="toh-stats-bar-track">
                    <div
                      className="toh-stats-bar-fill"
                      style={{
                        width: `${bar.pct * 3.3}%`,
                        background: `linear-gradient(90deg, ${bar.color}, ${bar.color}cc)`,
                        animationDelay: `${i * 100 + 400}ms`,
                      }}
                    />
                  </div>
                  <div className="toh-stats-bar-count">{bar.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0' }} className="toh-reveal" ref={featuresRevealRef}>
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

      {/* What's New / Changelog Section */}
      <section className="toh-changelog-section toh-reveal" ref={changelogRevealRef}>
        <div className="toh-container">
          <div className="toh-section-header">
            <div className="toh-section-eyebrow">What's New</div>
            <h2 className="toh-section-title">Changelog</h2>
            <p className="toh-section-subtitle">
              Stay up to date with the latest features, improvements, and fixes to TOH Bot.
            </p>
          </div>
          <div className="toh-changelog-timeline">
            {CHANGELOG.map((entry, i) => (
              <div
                key={entry.version}
                className="toh-changelog-entry toh-changelog-entry-stagger"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="toh-changelog-line-wrap">
                  <div className="toh-changelog-dot" />
                  {i < CHANGELOG.length - 1 && <div className="toh-changelog-line" />}
                </div>
                <div className="toh-changelog-content">
                  <div className="toh-changelog-meta">
                    <span className="toh-changelog-version">{entry.version}</span>
                    <span className="toh-changelog-date">{entry.date}</span>
                  </div>
                  <div className="toh-changelog-title">{entry.title}</div>
                  <div className="toh-changelog-desc">{entry.desc}</div>
                  <div className="toh-changelog-tags">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`toh-changelog-tag toh-changelog-tag-${
                          tag === 'New Feature' ? 'new' : tag === 'Improved' ? 'improved' : tag === 'Fixed' ? 'fixed' : 'default'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="toh-faq-section toh-reveal" ref={faqRevealRef}>
        <div className="toh-container">
          <div className="toh-section-header">
            <div className="toh-section-eyebrow">FAQ</div>
            <h2 className="toh-section-title">Common Questions</h2>
            <p className="toh-section-subtitle">
              Got questions? Here are the answers to the most common ones about TOH Bot.
            </p>
          </div>
          <div className="toh-faq-list">
            {[
              {
                q: 'How do I add TOH Bot to my server?',
                a: 'Click the "Add to Server" button above and authorize the bot through Discord. It takes less than 30 seconds — just select your server and approve the permissions.',
              },
              {
                q: 'Is TOH Bot free to use?',
                a: 'Yes! All core features including XP tracking, leaderboard lookups, and race mode are completely free. Some premium features may be available in the future.',
              },
              {
                q: 'How does the XP system work?',
                a: 'TOH Bot automatically tracks your XP based on your Tower of Hell activity. Use /level to check your progress, /rank to see your position, and /grind to plan your next level.',
              },
              {
                q: 'What is Race Mode?',
                a: 'Race Mode lets server members compete in real-time tower climbing challenges. Use /race create to start, /race join to participate, and the bot tracks everything automatically.',
              },
              {
                q: 'How often is the leaderboard updated?',
                a: 'The leaderboard is synced with official community records and updated regularly. You can always click "Refresh" on the leaderboard page to get the latest data.',
              },
              {
                q: 'Can I compare my stats with other players?',
                a: 'Absolutely! Use the /compare command in Discord, or click the "Compare" button on the leaderboard page to see a side-by-side comparison of any two players.',
              },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
