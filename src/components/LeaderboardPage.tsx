'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface Player {
  rank: number;
  username: string;
  level: number;
  country: string;
  device: string;
  last_updated: string;
}

interface BannedPlayer {
  rank: number;
  username: string;
  level: string;
  country: string;
  ban_reason: string;
  device: string;
}

type SortField = 'rank' | 'level' | 'username' | 'updated';
type TabType = 'active' | 'banned';

const PAGE_SIZE = 50;

const BAN_REASONS = [
  'Alts Abusement',
  'Exploiting',
  'Glitches',
  'Glitches (Coil)',
  'Glitches (Hook)',
  'Illegal Material',
  'Inappropriate Behaviour',
  'Roblox Ban',
  'Unknown',
];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [banned, setBanned] = useState<BannedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastFetch, setLastFetch] = useState<string>('');

  const [tab, setTab] = useState<TabType>('active');
  const [activeSearch, setActiveSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [activePage, setActivePage] = useState(1);

  const [bannedSearch, setBannedSearch] = useState('');
  const [banReasonFilter, setBanReasonFilter] = useState('');
  const [bannedPage, setBannedPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPlayers(data.players || []);
      setBanned(data.banned || []);
      setLastFetch(new Date().toLocaleTimeString());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered and sorted active players
  const filteredActive = useMemo(() => {
    let result = [...players];

    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.username.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q)
      );
    }

    if (deviceFilter) {
      result = result.filter((p) => {
        const d = p.device.trim();
        if (deviceFilter === 'PC') return d === 'PC';
        if (deviceFilter === 'Mobile') return d === 'Mobile';
        if (deviceFilter === 'Controller') return d === 'Controller';
        return true;
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'rank':
          cmp = a.rank - b.rank;
          break;
        case 'level':
          cmp = a.level - b.level;
          break;
        case 'username':
          cmp = a.username.localeCompare(b.username);
          break;
        case 'updated':
          cmp = (a.last_updated || '').localeCompare(b.last_updated || '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [players, activeSearch, deviceFilter, sortField, sortDir]);

  // Filtered banned players
  const filteredBanned = useMemo(() => {
    let result = [...banned];

    if (bannedSearch.trim()) {
      const q = bannedSearch.toLowerCase();
      result = result.filter((p) => p.username.toLowerCase().includes(q));
    }

    if (banReasonFilter) {
      result = result.filter((p) => p.ban_reason === banReasonFilter);
    }

    return result;
  }, [banned, bannedSearch, banReasonFilter]);

  // Pagination
  const activeTotalPages = Math.max(1, Math.ceil(filteredActive.length / PAGE_SIZE));
  const activePaged = filteredActive.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const bannedTotalPages = Math.max(1, Math.ceil(filteredBanned.length / PAGE_SIZE));
  const bannedPaged = filteredBanned.slice((bannedPage - 1) * PAGE_SIZE, bannedPage * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setActivePage(1); }, [activeSearch, deviceFilter, sortField, sortDir]);
  useEffect(() => { setBannedPage(1); }, [bannedSearch, banReasonFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const getDeviceClass = (device: string) => {
    const d = device.trim();
    if (d === 'PC') return 'toh-lb-device-pc';
    if (d === 'Mobile') return 'toh-lb-device-mobile';
    return 'toh-lb-device-other';
  };

  const maxLevel = 1341;

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (p: number) => void,
    totalItems: number,
  ) => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
    const endIdx = Math.min(currentPage * PAGE_SIZE, totalItems);

    return (
      <div className="toh-lb-pagination">
        <span className="toh-lb-page-info">
          Showing {startIdx}–{endIdx} of {totalItems}
        </span>
        <div className="toh-lb-page-btns">
          <button
            className="toh-lb-page-btn"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ‹
          </button>
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={`dots-${i}`} style={{ color: 'var(--dim)', display: 'flex', alignItems: 'center', padding: '0 4px' }}>…</span>
            ) : (
              <button
                key={p}
                className={`toh-lb-page-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          )}
          <button
            className="toh-lb-page-btn"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <section style={{ padding: '120px 0 80px' }}>
      <div className="toh-container">
        {/* Header */}
        <div className="toh-lb-header">
          <div className="toh-lb-logo-ring">🔥</div>
          <h1 className="toh-lb-title">Leaderboard</h1>
          <p className="toh-lb-subtitle">Official Community Rankings · Top 300</p>
        </div>

        {/* Status Bar */}
        <div className="toh-lb-status-bar">
          <div className="toh-lb-status-item">
            <span className={`toh-lb-status-dot ${loading ? 'updating' : error ? 'error' : ''}`} />
            <span>
              {loading ? 'Loading data...' : error ? 'Error loading data' : 'Data loaded'}
            </span>
            {loading && <div className="toh-lb-spinner" />}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {lastFetch && (
              <span className="toh-lb-status-item">
                Last fetch: {lastFetch}
              </span>
            )}
            <button
              className="toh-lb-cache-badge"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw size={12} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="toh-lb-tabs">
          <button
            className={`toh-lb-tab-btn ${tab === 'active' ? 'active' : ''}`}
            onClick={() => setTab('active')}
          >
            Active Players
            <span className="toh-lb-tab-count">{players.length}</span>
          </button>
          <button
            className={`toh-lb-tab-btn ${tab === 'banned' ? 'active' : ''}`}
            onClick={() => setTab('banned')}
          >
            Banned Leaderboard
            <span className="toh-lb-tab-count">{banned.length}</span>
          </button>
        </div>

        {/* Active Players Tab */}
        {tab === 'active' && (
          <div>
            <div className="toh-lb-controls">
              <div className="toh-lb-search-box">
                <Search size={16} className="toh-lb-search-icon" />
                <input
                  type="text"
                  placeholder="Search username or country…"
                  value={activeSearch}
                  onChange={(e) => setActiveSearch(e.target.value)}
                />
              </div>
              <select
                className="toh-lb-filter-select"
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
              >
                <option value="">All Devices</option>
                <option value="PC">PC</option>
                <option value="Mobile">Mobile</option>
                <option value="Controller">Controller</option>
              </select>
              <select
                className="toh-lb-filter-select"
                value={`${sortField}-${sortDir}`}
                onChange={(e) => {
                  const [f, d] = e.target.value.split('-') as [SortField, 'asc' | 'desc'];
                  setSortField(f);
                  setSortDir(d);
                }}
              >
                <option value="rank-asc">Sort: Rank ↑</option>
                <option value="rank-desc">Sort: Rank ↓</option>
                <option value="level-desc">Sort: Level ↓</option>
                <option value="level-asc">Sort: Level ↑</option>
                <option value="username-asc">Sort: Username A-Z</option>
                <option value="updated-desc">Sort: Last Updated</option>
              </select>
            </div>

            <div className="toh-lb-table-wrap">
              <table className="toh-lb-table">
                <thead>
                  <tr>
                    <th
                      className={sortField === 'rank' ? 'sorted' : ''}
                      onClick={() => handleSort('rank')}
                    >
                      Rank {sortField === 'rank' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                    <th
                      className={sortField === 'username' ? 'sorted' : ''}
                      onClick={() => handleSort('username')}
                    >
                      Username {sortField === 'username' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                    <th
                      className={sortField === 'level' ? 'sorted' : ''}
                      onClick={() => handleSort('level')}
                    >
                      Level {sortField === 'level' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                    <th>Country</th>
                    <th>Device</th>
                    <th
                      className={sortField === 'updated' ? 'sorted' : ''}
                      onClick={() => handleSort('updated')}
                    >
                      Last Updated {sortField === 'updated' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activePaged.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="toh-lb-no-results">
                          No players found matching your search.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activePaged.map((player) => (
                      <tr key={player.rank} className={player.rank <= 3 ? 'top-3' : ''}>
                        <td>
                          {player.rank <= 3 ? (
                            <span className={`toh-lb-rank-medal toh-lb-rank-${player.rank}`}>
                              {player.rank}
                            </span>
                          ) : (
                            <span style={{
                              fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
                              fontSize: '0.85rem',
                              color: 'var(--dim)',
                            }}>
                              #{player.rank}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="toh-lb-username">{player.username}</span>
                        </td>
                        <td style={{ minWidth: 140 }}>
                          <div className="toh-lb-level-num">Lv. {player.level.toLocaleString()}</div>
                          <div className="toh-lb-level-bar-bg">
                            <div
                              className="toh-lb-level-bar-fill"
                              style={{ width: `${Math.min(100, (player.level / maxLevel) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td>
                          <span className="toh-lb-country-cell">
                            {player.country === '-' ? '—' : player.country}
                          </span>
                        </td>
                        <td>
                          <span className={`toh-lb-device-badge ${getDeviceClass(player.device)}`}>
                            {player.device === '-' ? '—' : player.device.trim()}
                          </span>
                        </td>
                        <td>
                          <span className="toh-lb-date-cell">
                            {player.last_updated === '-' ? '—' : player.last_updated}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {renderPagination(activePage, activeTotalPages, setActivePage, filteredActive.length)}
          </div>
        )}

        {/* Banned Tab */}
        {tab === 'banned' && (
          <div>
            <div className="toh-lb-controls">
              <div className="toh-lb-search-box">
                <Search size={16} className="toh-lb-search-icon" />
                <input
                  type="text"
                  placeholder="Search username…"
                  value={bannedSearch}
                  onChange={(e) => setBannedSearch(e.target.value)}
                />
              </div>
              <select
                className="toh-lb-filter-select"
                value={banReasonFilter}
                onChange={(e) => setBanReasonFilter(e.target.value)}
              >
                <option value="">All Ban Reasons</option>
                {BAN_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="toh-lb-table-wrap">
              <table className="toh-lb-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Level</th>
                    <th>Country</th>
                    <th>Ban Reason</th>
                    <th>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedPaged.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="toh-lb-no-results">
                          No banned players found matching your search.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bannedPaged.map((player) => (
                      <tr key={player.rank}>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
                            fontSize: '0.85rem',
                            color: 'var(--dim)',
                          }}>
                            #{player.rank}
                          </span>
                        </td>
                        <td>
                          <span className="toh-lb-username">{player.username}</span>
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--violet)',
                          }}>
                            Lv. {player.level}
                          </span>
                        </td>
                        <td>
                          <span className="toh-lb-country-cell">
                            {player.country === '-' ? '—' : player.country}
                          </span>
                        </td>
                        <td>
                          <span className="toh-lb-ban-badge">{player.ban_reason}</span>
                        </td>
                        <td>
                          <span className={`toh-lb-device-badge ${getDeviceClass(player.device)}`}>
                            {player.device === '-' ? '—' : player.device.trim()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {renderPagination(bannedPage, bannedTotalPages, setBannedPage, filteredBanned.length)}
          </div>
        )}
      </div>
    </section>
  );
}
