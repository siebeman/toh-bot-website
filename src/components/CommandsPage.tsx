'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  // Level & XP
  { name: '/levelinfo', desc: 'Full XP breakdown for any level', usage: '/levelinfo <level>', category: 'Level & XP' },
  { name: '/towers', desc: 'Total towers to reach a level', usage: '/towers <level>', category: 'Level & XP' },
  { name: '/xpcalc', desc: 'Convert raw XP into a level', usage: '/xpcalc <xp>', category: 'Level & XP' },
  { name: '/compare', desc: 'XP gap and tower gap between two levels', usage: '/compare <level1> <level2>', category: 'Level & XP' },
  { name: '/xprate', desc: 'XP cost table across a level range', usage: '/xprate <start> <end>', category: 'Level & XP' },
  { name: '/partialxp', desc: 'XP for completing part of a tower', usage: '/partialxp <xp>', category: 'Level & XP' },
  { name: '/levelcap', desc: 'Stats about the level 1,000,000 cap', usage: '/levelcap', category: 'Level & XP' },
  { name: '/convert', desc: 'Convert between XP and towers', usage: '/convert <value>', category: 'Level & XP' },
  { name: '/whatsmylevel', desc: 'Estimate your level from tower win count', usage: '/whatsmylevel <wins>', category: 'Level & XP' },

  // Progress & Planning
  { name: '/progress', desc: 'Progress bar and towers left to reach a target level', usage: '/progress <target>', category: 'Progress & Planning' },
  { name: '/grind', desc: 'Full grind planner', usage: '/grind <target_level>', category: 'Progress & Planning' },
  { name: '/nextlevel', desc: 'Exactly what you need for your next level', usage: '/nextlevel', category: 'Progress & Planning' },
  { name: '/efficiency', desc: 'Compare grinding strategies', usage: '/efficiency', category: 'Progress & Planning' },
  { name: '/milestone', desc: 'Your next 10 round-number milestones', usage: '/milestone', category: 'Progress & Planning' },
  { name: '/skillpoints', desc: 'Skill tree progress', usage: '/skillpoints', category: 'Progress & Planning' },
  { name: '/xpgoal', desc: 'Towers needed to gain a target XP or levels', usage: '/xpgoal <target>', category: 'Progress & Planning' },
  { name: '/dailytarget', desc: 'Towers/levels per day to hit a level by a deadline', usage: '/dailytarget <level> <date>', category: 'Progress & Planning' },
  { name: '/xpperday', desc: 'XP/towers/levels per day to reach a level in N days', usage: '/xpperday <level> <days>', category: 'Progress & Planning' },
  { name: '/grindcalendar', desc: 'Set up a visual grind calendar on the website', usage: '/grindcalendar', category: 'Progress & Planning' },

  // Time & Stats
  { name: '/howlong', desc: 'Estimate time spent or real grind rate', usage: '/howlong', category: 'Time & Stats' },
  { name: '/howaddicted', desc: 'Full life-in-ToH summary with addiction tier', usage: '/howaddicted', category: 'Time & Stats' },
  { name: '/towermath', desc: 'Absurd real-world comparisons for your XP', usage: '/towermath', category: 'Time & Stats' },
  { name: '/whatif', desc: 'What level you\'d be if you started earlier', usage: '/whatif <date>', category: 'Time & Stats' },
  { name: '/towerstoday', desc: 'Session summary', usage: '/towerstoday', category: 'Time & Stats' },
  { name: '/seasonal', desc: 'Monthly grind review', usage: '/seasonal', category: 'Time & Stats' },
  { name: '/grindgraph', desc: 'PNG chart of your level progress', usage: '/grindgraph', category: 'Time & Stats' },
  { name: '/projection', desc: 'Are you on pace to hit your goal?', usage: '/projection <goal>', category: 'Time & Stats' },
  { name: '/website', desc: 'Link to the live Tower of Hell Bot website and race dashboard', usage: '/website', category: 'Time & Stats' },

  // Competitive
  { name: '/leaderboard', desc: 'Show public leaderboard (optional rank/username)', usage: '/leaderboard [rank|username]', category: 'Competitive' },
  { name: '/leaderboardcompare', desc: 'Compare two leaderboard players', usage: '/leaderboardcompare <user1> <user2>', category: 'Competitive' },
  { name: '/leaderboardstats', desc: 'Leaderboard-wide stats', usage: '/leaderboardstats', category: 'Competitive' },
  { name: '/leaderboardcountry', desc: 'Show players from a specific country', usage: '/leaderboardcountry <country>', category: 'Competitive' },
  { name: '/leaderboarddevice', desc: 'Show players from a specific device', usage: '/leaderboarddevice <device>', category: 'Competitive' },
  { name: '/leaderboardrange', desc: 'Show all players between two ranks', usage: '/leaderboardrange <min> <max>', category: 'Competitive' },
  { name: '/leaderboardwatch', desc: 'Ping you when a user reaches a target rank', usage: '/leaderboardwatch <user> <rank>', category: 'Competitive' },
  { name: '/race', desc: 'Race to a target level (simple comparison)', usage: '/race <target>', category: 'Competitive' },
  { name: '/race_create', desc: 'Start a real Discord race', usage: '/race_create', category: 'Competitive' },
  { name: '/race_join', desc: 'Join a real Discord race', usage: '/race_join', category: 'Competitive' },
  { name: '/race_start', desc: 'Start the race you created', usage: '/race_start', category: 'Competitive' },
  { name: '/race_status', desc: 'See status of a Discord race', usage: '/race_status', category: 'Competitive' },
  { name: '/race_end', desc: 'End or cancel the race you created', usage: '/race_end', category: 'Competitive' },
  { name: '/catchup', desc: 'How long to catch up to someone ahead', usage: '/catchup <user>', category: 'Competitive' },
  { name: '/overtake', desc: 'When you overtake someone grinding slower', usage: '/overtake <user>', category: 'Competitive' },
  { name: '/breakeven', desc: 'When your XP matches a player with a head start', usage: '/breakeven <user>', category: 'Competitive' },
  { name: '/compare_players', desc: 'Dramatic XP comparison', usage: '/compare_players <user1> <user2>', category: 'Competitive' },
  { name: '/podium', desc: 'Rank three players on a podium', usage: '/podium <user1> <user2> <user3>', category: 'Competitive' },
  { name: '/howfar', desc: 'Gap between two levels in hours/weeks', usage: '/howfar <level1> <level2>', category: 'Competitive' },

  // Fun
  { name: '/roast', desc: 'Get roasted based on your level', usage: '/roast', category: 'Fun' },
  { name: '/hype', desc: 'Get hyped up based on your level', usage: '/hype', category: 'Fun' },
  { name: '/shouldigrind', desc: '50/50 yes/no', usage: '/shouldigrind', category: 'Fun' },
  { name: '/shouldishower', desc: 'Should you shower?', usage: '/shouldishower', category: 'Fun' },
  { name: '/shouldigooutside', desc: 'Should you go outside?', usage: '/shouldigooutside', category: 'Fun' },
  { name: '/shouldisleep', desc: 'Should you sleep?', usage: '/shouldisleep', category: 'Fun' },
  { name: '/areyouoktohbot', desc: 'Check the bot\'s state', usage: '/areyouoktohbot', category: 'Fun' },
  { name: '/tohquote', desc: 'Random Tower of Hell wisdom', usage: '/tohquote', category: 'Fun' },
  { name: '/towerfact', desc: 'Random XP fact about the game', usage: '/towerfact', category: 'Fun' },
  { name: '/equivalent', desc: 'What your level is equivalent to', usage: '/equivalent', category: 'Fun' },
  { name: '/flex', desc: 'Generates a shareable level card image', usage: '/flex', category: 'Fun' },
  { name: '/levelcard', desc: 'Alias for /flex', usage: '/levelcard', category: 'Fun' },

  // Misc
  { name: '/ping', desc: 'Check bot latency', usage: '/ping', category: 'Misc' },
  { name: '/tohhelp', desc: 'Full command list in Discord', usage: '/tohhelp', category: 'Misc' },
  { name: '/remindme', desc: 'Set a grind reminder', usage: '/remindme <time> <message>', category: 'Misc' },
];

const CATEGORIES: CategoryInfo[] = [
  { name: 'Level & XP', icon: '📊', description: 'XP and level calculations', color: '#8b7cf6' },
  { name: 'Progress & Planning', icon: '🎯', description: 'Plan your grind', color: '#2ecc71' },
  { name: 'Time & Stats', icon: '⏱️', description: 'Time and statistics', color: '#f59e0b' },
  { name: 'Competitive', icon: '🏆', description: 'Compete and compare', color: '#e83b3b' },
  { name: 'Fun', icon: '🎉', description: 'Fun and entertainment', color: '#ec4899' },
  { name: 'Misc', icon: '⚙️', description: 'Utilities and more', color: '#3b82f6' },
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Listen for global search focus event */
  useEffect(() => {
    const onFocusSearch = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };
    window.addEventListener('toh-focus-search', onFocusSearch);
    return () => window.removeEventListener('toh-focus-search', onFocusSearch);
  }, []);

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
            ref={searchInputRef}
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
