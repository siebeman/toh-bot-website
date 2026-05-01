'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface Command {
  name: string;
  desc: string;
  category: string;
}

const COMMANDS: Command[] = [
  // General
  { name: '/help', desc: 'Show all available commands and usage info', category: 'General' },
  { name: '/botinfo', desc: 'Display bot information and statistics', category: 'General' },
  { name: '/ping', desc: 'Check the bot\'s response latency', category: 'General' },
  { name: '/invite', desc: 'Get the bot invite link for your server', category: 'General' },
  { name: '/support', desc: 'Get a link to the support server', category: 'General' },
  // XP & Levels
  { name: '/level', desc: 'Check your current level and XP progress', category: 'XP & Levels' },
  { name: '/rank', desc: 'View your rank on the leaderboard', category: 'XP & Levels' },
  { name: '/xp', desc: 'See your current XP and needed for next level', category: 'XP & Levels' },
  { name: '/progress', desc: 'View your XP progress bar and milestones', category: 'XP & Levels' },
  { name: '/grind', desc: 'Calculate XP needed to reach a target level', category: 'XP & Levels' },
  { name: '/compare', desc: 'Compare your stats with another player', category: 'XP & Levels' },
  { name: '/predict', desc: 'Estimate when you\'ll reach a target level', category: 'XP & Levels' },
  // Race
  { name: '/race create', desc: 'Create a new race with custom settings', category: 'Race' },
  { name: '/race join', desc: 'Join an active race in this server', category: 'Race' },
  { name: '/race leave', desc: 'Leave the current race', category: 'Race' },
  { name: '/race start', desc: 'Start the race (host only)', category: 'Race' },
  { name: '/race finish', desc: 'Mark yourself as finished in the race', category: 'Race' },
  { name: '/race cancel', desc: 'Cancel the current race (host only)', category: 'Race' },
  { name: '/race list', desc: 'List all active races in this server', category: 'Race' },
  // Leaderboard
  { name: '/leaderboard', desc: 'View the global Tower of Hell leaderboard', category: 'Leaderboard' },
  { name: '/top', desc: 'See the top 10 players by level', category: 'Leaderboard' },
  { name: '/search', desc: 'Search for a specific player on the leaderboard', category: 'Leaderboard' },
  { name: '/banned', desc: 'View the banned players leaderboard', category: 'Leaderboard' },
  // Admin
  { name: '/setup', desc: 'Configure the bot for your server', category: 'Admin' },
  { name: '/channel', desc: 'Set the bot\'s command channel', category: 'Admin' },
  { name: '/role', desc: 'Set required roles for commands', category: 'Admin' },
  { name: '/reset', desc: 'Reset server configuration to defaults', category: 'Admin' },
  { name: '/prefix', desc: 'Change the bot\'s prefix', category: 'Admin' },
];

const CATEGORIES = ['General', 'XP & Levels', 'Race', 'Leaderboard', 'Admin'];

export default function CommandsPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return COMMANDS;
    const q = search.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, Command[]> = {};
    for (const cat of CATEGORIES) {
      const cmds = filtered.filter((c) => c.category === cat);
      if (cmds.length > 0) {
        map[cat] = cmds;
      }
    }
    return map;
  }, [filtered]);

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

        <div className="toh-cmd-search-wrap">
          <Search size={16} className="toh-cmd-search-icon" />
          <input
            type="text"
            className="toh-cmd-search"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toh-cmd-categories">
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <div className="toh-cmd-category-title">{category}</div>
              <div className="toh-cmd-grid">
                {cmds.map((cmd) => (
                  <div key={cmd.name} className="toh-cmd-card">
                    <div>
                      <div className="toh-cmd-name">{cmd.name}</div>
                      <div className="toh-cmd-desc">{cmd.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
