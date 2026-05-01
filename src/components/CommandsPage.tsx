'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Copy, Check } from 'lucide-react';

interface Command {
  name: string;
  desc: string;
  usage: string;
  category: string;
}

interface CategoryInfo {
  name: string;
  icon: string;
  description: string;
  color: string;
}

const COMMANDS: Command[] = [
  // General
  { name: '/help', desc: 'Show all available commands and usage info', usage: '/help', category: 'General' },
  { name: '/botinfo', desc: 'Display bot information and statistics', usage: '/botinfo', category: 'General' },
  { name: '/ping', desc: 'Check the bot\'s response latency', usage: '/ping', category: 'General' },
  { name: '/invite', desc: 'Get the bot invite link for your server', usage: '/invite', category: 'General' },
  { name: '/support', desc: 'Get a link to the support server', usage: '/support', category: 'General' },
  // XP & Levels
  { name: '/level', desc: 'Check your current level and XP progress', usage: '/level [username]', category: 'XP & Levels' },
  { name: '/rank', desc: 'View your rank on the leaderboard', usage: '/rank [username]', category: 'XP & Levels' },
  { name: '/xp', desc: 'See your current XP and needed for next level', usage: '/xp [username]', category: 'XP & Levels' },
  { name: '/progress', desc: 'View your XP progress bar and milestones', usage: '/progress [username]', category: 'XP & Levels' },
  { name: '/grind', desc: 'Calculate XP needed to reach a target level', usage: '/grind <target_level>', category: 'XP & Levels' },
  { name: '/compare', desc: 'Compare your stats with another player', usage: '/compare <username>', category: 'XP & Levels' },
  { name: '/predict', desc: 'Estimate when you\'ll reach a target level', usage: '/predict <target_level>', category: 'XP & Levels' },
  // Race
  { name: '/race create', desc: 'Create a new race with custom settings', usage: '/race create [max_players]', category: 'Race' },
  { name: '/race join', desc: 'Join an active race in this server', usage: '/race join <race_id>', category: 'Race' },
  { name: '/race leave', desc: 'Leave the current race', usage: '/race leave', category: 'Race' },
  { name: '/race start', desc: 'Start the race (host only)', usage: '/race start', category: 'Race' },
  { name: '/race finish', desc: 'Mark yourself as finished in the race', usage: '/race finish', category: 'Race' },
  { name: '/race cancel', desc: 'Cancel the current race (host only)', usage: '/race cancel', category: 'Race' },
  { name: '/race list', desc: 'List all active races in this server', usage: '/race list', category: 'Race' },
  // Leaderboard
  { name: '/leaderboard', desc: 'View the global Tower of Hell leaderboard', usage: '/leaderboard [page]', category: 'Leaderboard' },
  { name: '/top', desc: 'See the top 10 players by level', usage: '/top [count]', category: 'Leaderboard' },
  { name: '/search', desc: 'Search for a specific player on the leaderboard', usage: '/search <username>', category: 'Leaderboard' },
  { name: '/banned', desc: 'View the banned players leaderboard', usage: '/banned [page]', category: 'Leaderboard' },
  // Admin
  { name: '/setup', desc: 'Configure the bot for your server', usage: '/setup', category: 'Admin' },
  { name: '/channel', desc: 'Set the bot\'s command channel', usage: '/channel <#channel>', category: 'Admin' },
  { name: '/role', desc: 'Set required roles for commands', usage: '/role <@role>', category: 'Admin' },
  { name: '/reset', desc: 'Reset server configuration to defaults', usage: '/reset', category: 'Admin' },
  { name: '/prefix', desc: 'Change the bot\'s prefix', usage: '/prefix <new_prefix>', category: 'Admin' },
];

const CATEGORIES: CategoryInfo[] = [
  { name: 'General', icon: '⚡', description: 'Core bot commands', color: '#8b7cf6' },
  { name: 'XP & Levels', icon: '📊', description: 'Track your progress', color: '#2ecc71' },
  { name: 'Race', icon: '🏁', description: 'Compete against others', color: '#e83b3b' },
  { name: 'Leaderboard', icon: '🏆', description: 'See who\'s on top', color: '#ffd700' },
  { name: 'Admin', icon: '⚙️', description: 'Server configuration', color: '#3b82f6' },
];

const RECENT_KEY = 'toh-cmd-recent';
const MAX_RECENT = 5;

/* ── Copy Toast ── */
function CopyToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toh-cmd-toast toh-cmd-toast-visible">
      <Check size={14} />
      <span>{message}</span>
    </div>
  );
}

/* Highlight matching text */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="toh-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function CommandsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  /* Load recently viewed from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        queueMicrotask(() => setRecentlyViewed(JSON.parse(stored)));
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* Show toast with auto-dismiss */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  /* Copy command to clipboard + track recently viewed */
  const handleCopy = useCallback((cmd: Command) => {
    navigator.clipboard.writeText(cmd.name).then(() => {
      showToast(`Copied ${cmd.name}`);
      setCopiedCmd(cmd.name);
      setTimeout(() => setCopiedCmd(null), 1200);

      /* Update recently viewed */
      setRecentlyViewed((prev) => {
        const next = [cmd.name, ...prev.filter((n) => n !== cmd.name)].slice(0, MAX_RECENT);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    }).catch(() => {
      showToast('Copy failed');
    });
  }, [showToast]);

  const filtered = useMemo(() => {
    let result = COMMANDS;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.usage.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      result = result.filter((c) => c.category === activeCategory);
    }
    return result;
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const map: Record<string, Command[]> = {};
    for (const cat of CATEGORIES) {
      const cmds = filtered.filter((c) => c.category === cat.name);
      if (cmds.length > 0) {
        map[cat.name] = cmds;
      }
    }
    return map;
  }, [filtered]);

  const recentlyViewedCmds = useMemo(() => {
    if (recentlyViewed.length === 0) return [];
    return recentlyViewed
      .map((name) => COMMANDS.find((c) => c.name === name))
      .filter((c): c is Command => c !== undefined);
  }, [recentlyViewed]);

  const getCategoryInfo = (name: string) => {
    return CATEGORIES.find((c) => c.name === name) || CATEGORIES[0];
  };

  const totalCommands = COMMANDS.length;
  const totalCategories = CATEGORIES.length;

  return (
    <section style={{ padding: '120px 0 80px' }}>
      <div className="toh-container">
        <div className="toh-section-header">
          <div className="toh-section-eyebrow">Commands</div>
          <h2 className="toh-section-title">Bot Commands</h2>
          <p className="toh-section-subtitle">
            Every command you need to track progress, compete, and climb the tower.
          </p>
        </div>

        {/* Command count summary */}
        <div className="toh-cmd-summary">
          <span className="toh-cmd-summary-num">{totalCommands}</span> commands across{' '}
          <span className="toh-cmd-summary-num">{totalCategories}</span> categories
        </div>

        {/* Category filter tabs */}
        <div className="toh-cmd-tabs">
          <button
            className={`toh-cmd-tab${!activeCategory ? ' toh-cmd-tab-active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`toh-cmd-tab${activeCategory === cat.name ? ' toh-cmd-tab-active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              style={{
                '--toh-cat-color': cat.color,
              } as React.CSSProperties}
            >
              <span className="toh-cmd-tab-icon">{cat.icon}</span>
              {cat.name}
              <span className="toh-cmd-tab-count">
                {COMMANDS.filter((c) => c.category === cat.name).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="toh-cmd-search-wrap">
          <Search size={16} className="toh-cmd-search-icon" />
          <input
            type="text"
            className="toh-cmd-search"
            placeholder="Search commands, usage syntax..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Recently viewed */}
        {recentlyViewedCmds.length > 0 && !search.trim() && !activeCategory && (
          <div className="toh-cmd-recent">
            <div className="toh-cmd-recent-title">
              <span className="toh-cmd-recent-icon">🕐</span>
              Recently Used
            </div>
            <div className="toh-cmd-recent-list">
              {recentlyViewedCmds.map((cmd) => (
                <button
                  key={cmd.name}
                  className="toh-cmd-recent-chip"
                  onClick={() => handleCopy(cmd)}
                  title={`Copy ${cmd.name}`}
                >
                  {cmd.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Command categories */}
        <div className="toh-cmd-categories">
          {Object.entries(grouped).map(([category, cmds]) => {
            const catInfo = getCategoryInfo(category);
            return (
              <div key={category}>
                <div className="toh-cmd-category-title">
                  <span className="toh-cmd-category-icon">{catInfo.icon}</span>
                  {category}
                  <span className="toh-cmd-count-badge">{cmds.length}</span>
                  <span className="toh-cmd-category-desc">{catInfo.description}</span>
                </div>
                <div className="toh-cmd-grid">
                  {cmds.map((cmd) => (
                    <div
                      key={cmd.name}
                      className="toh-cmd-card toh-cmd-card-hover"
                      style={{
                        '--toh-cat-color': catInfo.color,
                      } as React.CSSProperties}
                    >
                      <div className="toh-cmd-card-content">
                        <div className="toh-cmd-name-wrap">
                          <span className="toh-cmd-name">
                            <HighlightText text={cmd.name} query={search} />
                          </span>
                          <button
                            className="toh-cmd-copy-btn"
                            onClick={() => handleCopy(cmd)}
                            title={`Copy ${cmd.name}`}
                            aria-label={`Copy ${cmd.name} to clipboard`}
                          >
                            {copiedCmd === cmd.name ? (
                              <Check size={14} className="toh-cmd-copy-icon-copied" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                        <div className="toh-cmd-usage">
                          <HighlightText text={cmd.usage} query={search} />
                        </div>
                        <div className="toh-cmd-desc">
                          <HighlightText text={cmd.desc} query={search} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="toh-cmd-empty">
            <span className="toh-cmd-empty-icon">🔍</span>
            <div className="toh-cmd-empty-text">No commands found</div>
            <div className="toh-cmd-empty-hint">Try adjusting your search or category filter</div>
          </div>
        )}
      </div>

      <CopyToast message={toast} />
    </section>
  );
}
