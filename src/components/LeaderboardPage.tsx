'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, RefreshCw, X, Swords } from 'lucide-react';

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

const PER_PAGE_OPTIONS = [25, 50, 100];

/* ════════════════════════════════════════════
   Player Detail Modal
══════════════════════════════ */
function PlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const maxLevel = 1341;
  const nextMilestone = Math.ceil((player.level + 1) / 100) * 100;
  const milestoneProgress = ((player.level % 100) / 100) * 100;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="toh-modal-overlay" onClick={onClose}>
      <div className="toh-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="toh-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="toh-modal-header">
          <div className="toh-modal-avatar">{player.username[0]}</div>
          <div>
            <div className="toh-modal-name">{player.username}</div>
            <div className="toh-modal-rank">
              {player.rank <= 3 && (
                <span className={`toh-lb-rank-medal toh-lb-rank-${player.rank}`} style={{ width: 24, height: 24, fontSize: '0.6rem', display: 'inline-flex', marginRight: 8 }}>
                  {player.rank}
                </span>
              )}
              {player.rank > 3 && <span style={{ color: 'var(--dim)', marginRight: 8 }}>#{player.rank}</span>}
              Rank
            </div>
          </div>
        </div>

        <div className="toh-modal-section">
          <div className="toh-modal-label">Level</div>
          <div className="toh-modal-level-row">
            <span className="toh-modal-level-num">Lv. {player.level.toLocaleString()}</span>
            <span className="toh-modal-level-max">/ {maxLevel.toLocaleString()}</span>
          </div>
          <div className="toh-modal-level-bar-bg">
            <div
              className="toh-modal-level-bar-fill"
              style={{ width: `${Math.min(100, (player.level / maxLevel) * 100)}%` }}
            />
          </div>
        </div>

        <div className="toh-modal-section">
          <div className="toh-modal-label">Next Milestone</div>
          <div className="toh-modal-milestone">
            <span>Level {nextMilestone}</span>
            <span style={{ color: 'var(--dim)', fontSize: 13 }}>
              {milestoneProgress.toFixed(0)}% there
            </span>
          </div>
          <div className="toh-modal-level-bar-bg" style={{ height: 6 }}>
            <div
              className="toh-modal-level-bar-fill"
              style={{ width: `${milestoneProgress}%`, background: 'linear-gradient(90deg, var(--indigo), #a78bfa)' }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>
            {nextMilestone - player.level} levels to go
          </div>
        </div>

        <div className="toh-modal-grid">
          <div className="toh-modal-field">
            <div className="toh-modal-label">Country</div>
            <div className="toh-modal-value">{player.country === '-' ? '—' : player.country}</div>
          </div>
          <div className="toh-modal-field">
            <div className="toh-modal-label">Device</div>
            <div className="toh-modal-value">{player.device === '-' ? '—' : player.device.trim()}</div>
          </div>
        </div>

        <div className="toh-modal-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="toh-modal-label">Last Updated</div>
          <div className="toh-modal-value" style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 13, color: 'var(--dim)' }}>
            {player.last_updated === '-' ? '—' : player.last_updated}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Player Comparison Modal
════════════════════════════════════════════ */
function ComparePlayersModal({
  players,
  onClose,
}: {
  players: Player[];
  onClose: () => void;
}) {
  const maxLevel = 1341;
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [selectedA, setSelectedA] = useState<Player | null>(null);
  const [selectedB, setSelectedB] = useState<Player | null>(null);
  const [dropdownAOpen, setDropdownAOpen] = useState(false);
  const [dropdownBOpen, setDropdownBOpen] = useState(false);
  const dropdownARef = useRef<HTMLDivElement>(null);
  const dropdownBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownARef.current && !dropdownARef.current.contains(e.target as Node)) {
        setDropdownAOpen(false);
      }
      if (dropdownBRef.current && !dropdownBRef.current.contains(e.target as Node)) {
        setDropdownBOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredA = useMemo(() => {
    if (!searchA.trim()) return players.slice(0, 50);
    const q = searchA.toLowerCase();
    return players.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [players, searchA]);

  const filteredB = useMemo(() => {
    if (!searchB.trim()) return players.slice(0, 50);
    const q = searchB.toLowerCase();
    return players.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [players, searchB]);

  const levelDiff = selectedA && selectedB ? selectedA.level - selectedB.level : 0;
  const rankDiff = selectedA && selectedB ? selectedB.rank - selectedA.rank : 0; // lower rank = better, so invert

  const renderPlayerDropdown = (
    label: string,
    search: string,
    setSearch: (v: string) => void,
    filtered: Player[],
    selected: Player | null,
    setSelected: (p: Player) => void,
    dropdownOpen: boolean,
    setDropdownOpen: (v: boolean) => void,
    dropdownRef: React.RefObject<HTMLDivElement | null>,
    otherSelected: Player | null,
  ) => (
    <div className="toh-compare-player-col" ref={dropdownRef}>
      <div className="toh-compare-dropdown-label">{label}</div>
      <div className="toh-compare-dropdown-wrap">
        <input
          className="toh-compare-dropdown-input"
          type="text"
          placeholder="Search player…"
          value={dropdownOpen ? search : selected ? selected.username : ''}
          onChange={(e) => {
            setSearch(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
        />
        {dropdownOpen && (
          <div className="toh-compare-dropdown-list">
            {filtered.length === 0 ? (
              <div className="toh-compare-dropdown-empty">No players found</div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.rank}
                  className={`toh-compare-dropdown-item ${selected?.rank === p.rank ? 'active' : ''} ${otherSelected?.rank === p.rank ? 'disabled' : ''}`}
                  onClick={() => {
                    setSelected(p);
                    setSearch('');
                    setDropdownOpen(false);
                  }}
                  disabled={otherSelected?.rank === p.rank}
                >
                  <span className="toh-compare-dropdown-item-avatar">{p.username[0]}</span>
                  <span className="toh-compare-dropdown-item-name">{p.username}</span>
                  <span className="toh-compare-dropdown-item-rank">#{p.rank}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderComparisonRow = (
    label: string,
    valueA: React.ReactNode,
    valueB: React.ReactNode,
    winnerA?: boolean | null,
    winnerB?: boolean | null,
  ) => (
    <div className="toh-compare-row">
      <div className={`toh-compare-cell ${winnerA ? 'toh-compare-winner' : ''}`}>
        {valueA}
      </div>
      <div className="toh-compare-row-label">{label}</div>
      <div className={`toh-compare-cell ${winnerB ? 'toh-compare-winner' : ''}`}>
        {valueB}
      </div>
    </div>
  );

  return (
    <div className="toh-modal-overlay" onClick={onClose}>
      <div className="toh-compare-content" onClick={(e) => e.stopPropagation()}>
        <button className="toh-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="toh-compare-header">
          <Swords size={22} className="toh-compare-header-icon" />
          <h2 className="toh-compare-title">Compare Players</h2>
        </div>

        {/* Player Selection */}
        <div className="toh-compare-selection">
          {renderPlayerDropdown('Player 1', searchA, setSearchA, filteredA, selectedA, setSelectedA, dropdownAOpen, setDropdownAOpen, dropdownARef, selectedB)}
          <div className="toh-compare-vs-badge">VS</div>
          {renderPlayerDropdown('Player 2', searchB, setSearchB, filteredB, selectedB, setSelectedB, dropdownBOpen, setDropdownBOpen, dropdownBRef, selectedA)}
        </div>

        {/* Comparison Table */}
        {selectedA && selectedB ? (
          <div className="toh-compare-table">
            {/* Username Row */}
            {renderComparisonRow(
              'Player',
              <div className="toh-compare-player-info">
                <div className="toh-compare-avatar">{selectedA.username[0]}</div>
                <span className="toh-compare-username">{selectedA.username}</span>
              </div>,
              <div className="toh-compare-player-info">
                <div className="toh-compare-avatar">{selectedB.username[0]}</div>
                <span className="toh-compare-username">{selectedB.username}</span>
              </div>,
            )}

            {/* Rank Row */}
            {renderComparisonRow(
              'Rank',
              <div className="toh-compare-rank-cell">
                {selectedA.rank <= 3 ? (
                  <span className={`toh-lb-rank-medal toh-lb-rank-${selectedA.rank}`}>{selectedA.rank}</span>
                ) : (
                  <span>#{selectedA.rank}</span>
                )}
              </div>,
              <div className="toh-compare-rank-cell">
                {selectedB.rank <= 3 ? (
                  <span className={`toh-lb-rank-medal toh-lb-rank-${selectedB.rank}`}>{selectedB.rank}</span>
                ) : (
                  <span>#{selectedB.rank}</span>
                )}
              </div>,
              selectedA.rank < selectedB.rank,
              selectedB.rank < selectedA.rank,
            )}

            {/* Level Row */}
            {renderComparisonRow(
              'Level',
              <div className="toh-compare-level-cell">
                <div className="toh-compare-level-num">Lv. {selectedA.level.toLocaleString()}</div>
                <div className="toh-compare-level-bar-bg">
                  <div
                    className="toh-compare-level-bar-fill"
                    style={{ width: `${Math.min(100, (selectedA.level / maxLevel) * 100)}%` }}
                  />
                </div>
              </div>,
              <div className="toh-compare-level-cell">
                <div className="toh-compare-level-num">Lv. {selectedB.level.toLocaleString()}</div>
                <div className="toh-compare-level-bar-bg">
                  <div
                    className="toh-compare-level-bar-fill"
                    style={{ width: `${Math.min(100, (selectedB.level / maxLevel) * 100)}%` }}
                  />
                </div>
              </div>,
              selectedA.level > selectedB.level,
              selectedB.level > selectedA.level,
            )}

            {/* Country Row */}
            {renderComparisonRow(
              'Country',
              <span>{selectedA.country === '-' ? '—' : selectedA.country}</span>,
              <span>{selectedB.country === '-' ? '—' : selectedB.country}</span>,
            )}

            {/* Device Row */}
            {renderComparisonRow(
              'Device',
              <span className={`toh-lb-device-badge ${selectedA.device.trim() === 'PC' ? 'toh-lb-device-pc' : selectedA.device.trim() === 'Mobile' ? 'toh-lb-device-mobile' : 'toh-lb-device-other'}`}>
                {selectedA.device === '-' ? '—' : selectedA.device.trim()}
              </span>,
              <span className={`toh-lb-device-badge ${selectedB.device.trim() === 'PC' ? 'toh-lb-device-pc' : selectedB.device.trim() === 'Mobile' ? 'toh-lb-device-mobile' : 'toh-lb-device-other'}`}>
                {selectedB.device === '-' ? '—' : selectedB.device.trim()}
              </span>,
            )}

            {/* Last Updated Row */}
            {renderComparisonRow(
              'Last Updated',
              <span className="toh-lb-date-cell">{selectedA.last_updated === '-' ? '—' : selectedA.last_updated}</span>,
              <span className="toh-lb-date-cell">{selectedB.last_updated === '-' ? '—' : selectedB.last_updated}</span>,
            )}

            {/* Difference Summary */}
            <div className="toh-compare-diff">
              <div className="toh-compare-diff-row">
                <span className={`toh-compare-diff-value ${levelDiff > 0 ? 'positive' : levelDiff < 0 ? 'negative' : ''}`}>
                  {levelDiff > 0 ? `+${levelDiff.toLocaleString()}` : levelDiff < 0 ? levelDiff.toLocaleString() : '0'}
                </span>
                <span className="toh-compare-diff-label">Level Gap</span>
                <span className={`toh-compare-diff-value ${levelDiff < 0 ? 'positive' : levelDiff > 0 ? 'negative' : ''}`}>
                  {levelDiff < 0 ? `+${Math.abs(levelDiff).toLocaleString()}` : levelDiff > 0 ? `-${levelDiff.toLocaleString()}` : '0'}
                </span>
              </div>
              <div className="toh-compare-diff-row">
                <span className={`toh-compare-diff-value ${rankDiff > 0 ? 'positive' : rankDiff < 0 ? 'negative' : ''}`}>
                  {rankDiff > 0 ? `+${rankDiff}` : rankDiff < 0 ? `${rankDiff}` : '0'}
                </span>
                <span className="toh-compare-diff-label">Rank Advantage</span>
                <span className={`toh-compare-diff-value ${rankDiff < 0 ? 'positive' : rankDiff > 0 ? 'negative' : ''}`}>
                  {rankDiff < 0 ? `+${Math.abs(rankDiff)}` : rankDiff > 0 ? `-${rankDiff}` : '0'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="toh-compare-empty">
            Select two players above to see the comparison
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Leaderboard Page
════════════════════════════════════════════ */
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
  const [pageSize, setPageSize] = useState(50);

  const [bannedSearch, setBannedSearch] = useState('');
  const [banReasonFilter, setBanReasonFilter] = useState('');
  const [bannedPage, setBannedPage] = useState(1);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [countryExpanded, setCountryExpanded] = useState(true);

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

  // Country distribution from active filtered players
  const countryDistribution = useMemo(() => {
    const knownCountryPlayers = filteredActive.filter((p) => p.country !== '-');
    const totalWithCountry = knownCountryPlayers.length;
    const map = new Map<string, number>();
    for (const p of knownCountryPlayers) {
      map.set(p.country, (map.get(p.country) || 0) + 1);
    }
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalWithCountry > 0 ? (count / totalWithCountry) * 100 : 0,
      }));
    return { countries: sorted, totalCountries: map.size, totalWithCountry };
  }, [filteredActive]);

  // Pagination
  const activeTotalPages = Math.max(1, Math.ceil(filteredActive.length / pageSize));
  const activePaged = filteredActive.slice((activePage - 1) * pageSize, activePage * pageSize);

  const bannedTotalPages = Math.max(1, Math.ceil(filteredBanned.length / pageSize));
  const bannedPaged = filteredBanned.slice((bannedPage - 1) * pageSize, bannedPage * pageSize);

  // Reset page when filters change
  useEffect(() => { setActivePage(1); }, [activeSearch, deviceFilter, sortField, sortDir, pageSize]);
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

    const startIdx = (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="toh-lb-pagination">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="toh-lb-page-info">
            Showing {startIdx}–{endIdx} of {totalItems}
          </span>
          <div className="toh-lb-perpage">
            <select
              className="toh-lb-perpage-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}/page</option>
              ))}
            </select>
          </div>
        </div>
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

  // Top 3 for podium
  const top3 = filteredActive.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3; // 2nd, 1st, 3rd
  const medalEmoji = ['🥇', '🥈', '🥉'];
  const podiumHeights = ['140px', '180px', '120px'];
  const podiumLabels = ['2nd', '1st', '3rd'];
  const podiumColors = [
    'linear-gradient(135deg, rgba(192, 192, 192, 0.12), rgba(192, 192, 192, 0.04))',
    'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.04))',
    'linear-gradient(135deg, rgba(205, 127, 50, 0.12), rgba(205, 127, 50, 0.04))',
  ];
  const podiumBorders = [
    'rgba(192, 192, 192, 0.25)',
    'rgba(255, 215, 0, 0.35)',
    'rgba(205, 127, 50, 0.25)',
  ];

  return (
    <section style={{ padding: '120px 0 80px' }}>
      <div className="toh-container">
        {/* Header */}
        <div className="toh-lb-header">
          <div className="toh-lb-logo-ring">🔥</div>
          <h1 className="toh-lb-title">Leaderboard</h1>
          <p className="toh-lb-subtitle">Official Community Rankings · Top 300</p>
        </div>

        {/* Top 3 Podium */}
        {tab === 'active' && top3.length >= 3 && !activeSearch && !deviceFilter && (
          <div className="toh-podium">
            {podiumOrder.map((player, i) => {
              const actualIndex = i === 0 ? 1 : i === 1 ? 0 : 2;
              return (
                <div
                  key={player.username}
                  className="toh-podium-card"
                  style={{
                    background: podiumColors[i],
                    borderColor: podiumBorders[i],
                    animationDelay: `${i * 100}ms`,
                  }}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="toh-podium-medal">{medalEmoji[actualIndex]}</div>
                  <div className="toh-podium-avatar" style={{
                    borderColor: podiumBorders[i],
                  }}>
                    {player.username[0]}
                  </div>
                  <div className="toh-podium-name">{player.username}</div>
                  <div className="toh-podium-rank">{podiumLabels[i]}</div>
                  <div className="toh-podium-level">Lv. {player.level.toLocaleString()}</div>
                  <div className="toh-podium-bar-bg">
                    <div className="toh-podium-bar-fill" style={{ width: `${Math.min(100, (player.level / maxLevel) * 100)}%` }} />
                  </div>
                  {player.country !== '-' && (
                    <div className="toh-podium-country">{player.country}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Country Distribution */}
        {tab === 'active' && countryDistribution.countries.length > 0 && (
          <div className="toh-country-panel">
            <button
              className="toh-country-header"
              onClick={() => setCountryExpanded((v) => !v)}
              aria-expanded={countryExpanded}
              aria-label="Toggle country distribution"
            >
              <span className="toh-country-title">
                <span className="toh-country-title-icon">🌍</span>
                Country Distribution
              </span>
              <span className="toh-country-meta">
                <span className="toh-country-total-badge">
                  {countryDistribution.totalCountries} countries
                </span>
                <span className={`toh-country-chevron ${countryExpanded ? 'expanded' : ''}`}>▾</span>
              </span>
            </button>
            <div className={`toh-country-body ${countryExpanded ? 'expanded' : 'collapsed'}`}>
              <div className="toh-country-chart">
                {countryDistribution.countries.map((item, i) => (
                  <div className="toh-country-row" key={item.country} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="toh-country-row-left">
                      <span className={`toh-country-rank-badge toh-country-rank-${i + 1}`}>{i + 1}</span>
                      <span className="toh-country-name">{item.country}</span>
                    </div>
                    <div className="toh-country-row-center">
                      <div className="toh-country-bar-track">
                        <div
                          className={`toh-country-bar-fill toh-country-bar-${i + 1}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="toh-country-row-right">
                      <span className="toh-country-count">{item.count}</span>
                      <span className="toh-country-pct">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              {countryDistribution.totalCountries > 10 && (
                <div className="toh-country-footer">
                  Showing top 10 of {countryDistribution.totalCountries} countries · {countryDistribution.totalWithCountry} players with known country
                </div>
              )}
              {countryDistribution.totalCountries <= 10 && countryDistribution.totalWithCountry > 0 && (
                <div className="toh-country-footer">
                  {countryDistribution.totalWithCountry} players with known country
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="toh-lb-status-bar">
          <div className="toh-lb-status-item">
            <span className={`toh-lb-status-dot toh-pulse-prominent ${loading ? 'updating' : error ? 'error' : ''}`} />
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
              <button
                className="toh-compare-btn"
                onClick={() => setShowCompare(true)}
              >
                <Swords size={14} />
                Compare
              </button>
            </div>

            <div className="toh-lb-table-wrap toh-lb-table-mobile">
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
                    activePaged.map((player, i) => (
                      <tr
                        key={player.rank}
                        className={`toh-lb-row ${player.rank <= 3 ? 'top-3' : ''}`}
                        style={{ animationDelay: `${i * 30}ms` }}
                        onClick={() => setSelectedPlayer(player)}
                      >
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

            <div className="toh-lb-data-source">
              Data sourced from official community records
            </div>
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

            <div className="toh-lb-table-wrap toh-lb-table-mobile">
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
                    bannedPaged.map((player, i) => (
                      <tr
                        key={player.rank}
                        className="toh-lb-row"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
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

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      {/* Compare Players Modal */}
      {showCompare && (
        <ComparePlayersModal players={players} onClose={() => setShowCompare(false)} />
      )}
    </section>
  );
}
