'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';

// ════════════════════════════════════════════════
//  TYPES
// ════════════════════════════════════════════════
interface RaceData {
  id: string;
  short_id: string;
  name: string;
  status: 'waiting' | 'active' | 'finished';
  goal_type: string;
  goal_amount: number;
  started_at: string | null;
  guild_id: string;
  guild_name: string;
  guild_icon: string;
  created_at: string;
}

interface RacerData {
  user_id: string;
  race_id: string;
  display_name: string;
  start_xp: number;
  current_xp: number;
  start_level: number;
  goal_xp: number;
  current_average: number | null;
  finished: boolean;
  avatar_url: string | null;
}

interface LogEntry {
  id?: string;
  logged_at: string;
  username: string;
  log_type: string;
  towers_won?: number;
  tower_type?: string;
  completion_time?: number;
  new_level?: number;
  xp_gained?: number;
}

type RaceView = 'loading' | 'creds' | 'empty' | 'server-picker' | 'race-picker' | 'race' | 'error';

// ════════════════════════════════════════════════
//  DEFAULTS
// ════════════════════════════════════════════════
const DEFAULT_URL = 'https://anmczmzyvlvmmzfkbqvk.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWN6bXp5dmx2bW16ZmticXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjYxNjIsImV4cCI6MjA4OTk0MjE2Mn0.5erfLnL39TrSwgTFYctHACIC1SQPDW4SvRHp6HudtXI';

// ════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════
function lvlFromXP(xp: number): number {
  return Math.min(Math.floor((-1 + Math.sqrt(Math.max(0, 1 + 4 * xp / 50))) / 2), 1000000);
}

function fmtXP(xp: number): string {
  const n = Number(xp) || 0;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

function fmtTime(s: number): string {
  const n = Number(s) || 0;
  const m = Math.floor(n / 60);
  const ss = (n % 60).toFixed(1);
  return m > 0 ? `${m}M${ss.replace('.0', '')}S` : `${ss.replace('.0', '')}S`;
}

function fmtTimer(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function calcETA(r: RacerData, startedAt: Date | null): string {
  const xpGained = Number(r.current_xp) - Number(r.start_xp);
  const left = Number(r.goal_xp) - xpGained;
  if (left <= 0) return 'Done!';
  if (!startedAt) return '—';
  const elapsed = (Date.now() - startedAt.getTime()) / 60000;
  if (elapsed < 0.5 || xpGained <= 0) return '…';
  const mins = Math.ceil(left / (xpGained / elapsed));
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `~${mins}m`;
}

// ════════════════════════════════════════════════
//  CONFETTI COMPONENT
// ════════════════════════════════════════════════
const CONFETTI_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#f97316', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#fbbf24', '#a78bfa'];

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 100,
    }))
  ).current;

  return (
    <div className="toh-confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="toh-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--confetti-rotation': `${p.rotation}deg`,
            '--confetti-drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════
export default function RaceModePage() {
  // Supabase state
  const [sb, setSb] = useState<SupabaseClient | null>(null);
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [connStatus, setConnStatus] = useState('Not connected');
  const [connLive, setConnLive] = useState(false);

  // Race state
  const [view, setView] = useState<RaceView>('loading');
  const [racesList, setRacesList] = useState<RaceData[]>([]);
  const [racersList, setRacersList] = useState<{ race_id: string }[]>([]);
  const [currentRace, setCurrentRace] = useState<RaceData | null>(null);
  const [racers, setRacers] = useState<Record<string, RacerData>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  // Timer
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rtRef = useRef<RealtimeChannel | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rtRef.current && sb) sb.removeChannel(rtRef.current);
    };
  }, [sb]);

  // ── Error ───────────────────────────────────
  const showError = useCallback((title: string, msg: string) => {
    setErrorTitle(title);
    setErrorMsg(msg);
    setView('error');
    setConnStatus('Error');
    setConnLive(false);
  }, []);

  // ── Timer ───────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback((sa: Date) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - sa.getTime()) / 1000);
      setTimerDisplay(fmtTimer(s));
    }, 1000);
  }, []);

  // ── Realtime Subscription ───────────────────
  const subscribeRT = useCallback((client: SupabaseClient, raceId: string) => {
    if (rtRef.current) client.removeChannel(rtRef.current);

    rtRef.current = client
      .channel(`race-${raceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'racers', filter: `race_id=eq.${raceId}` }, (payload: any) => {
        if (!payload.new) return;
        setRacers(prev => {
          const updated = { ...prev };
          updated[payload.new.user_id] = payload.new;
          return updated;
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'race_logs', filter: `race_id=eq.${raceId}` }, (payload: any) => {
        if (payload.new) {
          setLogs(prev => [payload.new as LogEntry, ...prev].slice(0, 50));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'races', filter: `id=eq.${raceId}` }, (payload: any) => {
        if (!payload.new) return;
        setCurrentRace(payload.new);
        if (payload.new.status === 'finished') {
          stopTimer();
          setConnStatus('Race finished');
          setConnLive(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        if (payload.new.status === 'active' && payload.new.started_at) {
          const sa = new Date(payload.new.started_at);
          setStartedAt(sa);
          startTimer(sa);
        }
      })
      .subscribe((status: string) => {
        setConnStatus(status === 'SUBSCRIBED' ? 'Live' : status);
        setConnLive(status === 'SUBSCRIBED');
      });
  }, [startTimer, stopTimer]);

  // ── Server Picker ───────────────────────────
  const renderServerPicker = useCallback((races?: RaceData[], racerCounts?: { race_id: string }[]) => {
    const r = races || racesList;
    const rc = racerCounts || racersList;

    // Group by server
    const servers: Record<string, { name: string; icon: string; raceCount: number; userCount: number; id: string }> = {};
    r.forEach(race => {
      const gId = race.guild_id || 'unknown';
      const gName = race.guild_name || 'Unknown Server';
      const gIcon = race.guild_icon || '';
      if (!servers[gId]) {
        servers[gId] = { name: gName, icon: gIcon, raceCount: 0, userCount: 0, id: gId };
      }
      servers[gId].raceCount++;
      const userCount = rc.filter(u => u.race_id === race.id).length;
      servers[gId].userCount += userCount;
    });

    setView('server-picker');
    setConnStatus('Select a server');
    setConnLive(true);
    setSelectedServerId(null);
  }, [racesList, racersList]);

  // ── Race Picker ─────────────────────────────
  const renderRacePicker = useCallback((guildId: string) => {
    setSelectedServerId(guildId);
    setView('race-picker');
    const filtered = racesList.filter(r => (r.guild_id || 'unknown') === guildId);
    const serverName = filtered[0]?.guild_name || 'Unknown Server';
    setConnStatus(`Select a race in ${serverName}`);
    setConnLive(true);
  }, [racesList]);

  // ── Select Race ─────────────────────────────
  const selectRace = useCallback(async (race: RaceData, client?: SupabaseClient, races?: RaceData[], racerCounts?: { race_id: string }[]) => {
    const c = client || sb;
    if (!c) return;

    setCurrentRace(race);

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('id', race.short_id);
    window.history.pushState({}, '', url);

    setView('race');

    // Render race meta
    if (race.status === 'active' && race.started_at) {
      const sa = new Date(race.started_at);
      setStartedAt(sa);
      startTimer(sa);
    } else {
      setStartedAt(null);
      stopTimer();
      setTimerDisplay('00:00');
    }

    // Load racers
    const { data: racerData } = await c.from('racers').select('*').eq('race_id', race.id);
    const racerMap: Record<string, RacerData> = {};
    (racerData || []).forEach((r: RacerData) => { racerMap[r.user_id] = r; });
    setRacers(racerMap);

    // Load logs
    const { data: logData } = await c.from('race_logs').select('*').eq('race_id', race.id).order('logged_at', { ascending: false }).limit(40);
    setLogs((logData || []) as LogEntry[]);

    // Subscribe to realtime
    subscribeRT(c, race.id);

    setConnStatus('Live');
    setConnLive(true);
  }, [sb, startTimer, stopTimer, subscribeRT]);

  // ── Load Races ──────────────────────────────
  const loadRaces = useCallback(async (client?: SupabaseClient) => {
    const c = client || sb;
    if (!c) return;
    try {
      const { data: rd, error: re } = await c
        .from('races')
        .select('*')
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false });

      if (re) { showError('Query failed', re.message); return; }
      const races: RaceData[] = rd || [];
      setRacesList(races);

      if (!races.length) {
        setView('empty');
        setConnStatus('Connected — no active race');
        setConnLive(false);
        return;
      }

      // Fetch racer counts
      const rIds = races.map(r => r.id);
      const { data: rc } = await c.from('racers').select('race_id').in('race_id', rIds);
      setRacersList(rc || []);

      // Check URL for a specific race ID
      const urlParams = new URLSearchParams(window.location.search);
      const targetShortId = urlParams.get('id');
      if (targetShortId) {
        const target = races.find(r => r.short_id === targetShortId);
        if (target) {
          await selectRace(target, c, races, rc || []);
          return;
        }
      }

      renderServerPicker(races, rc || []);
    } catch (e: any) {
      showError('Failed to load races', e.message || String(e));
    }
  }, [sb, showError, selectRace, renderServerPicker]);

  // ── Connect ─────────────────────────────────
  const doConnect = useCallback(async (url: string, key: string) => {
    setConnStatus('Connecting…');
    setConnLive(false);
    try {
      const client = createClient(url, key);
      setSb(client);
      sessionStorage.setItem('sb_url', url);
      sessionStorage.setItem('sb_key', key);
      await loadRaces(client);
    } catch (e: any) {
      showError('Connection failed', e.message || String(e));
    }
  }, [loadRaces, showError]);

  // ── Go Back to Races ────────────────────────
  const goBackToRaces = useCallback(() => {
    if (rtRef.current && sb) sb.removeChannel(rtRef.current);
    stopTimer();
    setCurrentRace(null);
    setRacers({});
    setLogs([]);
    setStartedAt(null);
    setTimerDisplay('00:00');
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    renderServerPicker();
  }, [sb, stopTimer, renderServerPicker]);

  // Auto-connect on mount
  useEffect(() => {
    const savedUrl = sessionStorage.getItem('sb_url') || DEFAULT_URL;
    const savedKey = sessionStorage.getItem('sb_key') || DEFAULT_KEY;
    setSbUrl(savedUrl); // eslint-disable-line react-hooks/set-state-in-effect
    setSbKey(savedKey);
    if (savedUrl && savedKey) {
      doConnect(savedUrl, savedKey);
    } else {
      setView('creds');
    }
  }, []);

  // ── Sorted racers ───────────────────────────
  const sortedRacers = Object.values(racers).sort((a, b) => {
    const isAvg = currentRace?.goal_type === 'average';
    if (isAvg) {
      if (a.finished !== b.finished) return b.finished ? 1 : -1;
      return (Number(a.current_average) || 99999) - (Number(b.current_average) || 99999);
    }
    return (Number(b.current_xp) - Number(b.start_xp)) - (Number(a.current_xp) - Number(a.start_xp));
  });

  const medals = ['🥇', '🥈', '🥉'];

  // ── Server grouping for picker ──────────────
  const serverGroups = React.useMemo(() => {
    const servers: Record<string, { name: string; icon: string; raceCount: number; userCount: number; id: string }> = {};
    racesList.forEach(race => {
      const gId = race.guild_id || 'unknown';
      const gName = race.guild_name || 'Unknown Server';
      const gIcon = race.guild_icon || '';
      if (!servers[gId]) {
        servers[gId] = { name: gName, icon: gIcon, raceCount: 0, userCount: 0, id: gId };
      }
      servers[gId].raceCount++;
      const userCount = racersList.filter(u => u.race_id === race.id).length;
      servers[gId].userCount += userCount;
    });
    return Object.values(servers).sort((a, b) => b.raceCount - a.raceCount);
  }, [racesList, racersList]);

  const filteredRacesForPicker = React.useMemo(() => {
    if (!selectedServerId) return [];
    return racesList.filter(r => (r.guild_id || 'unknown') === selectedServerId);
  }, [racesList, selectedServerId]);

  // ════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════
  return (
    <section className="toh-race-hero">
      <div className="toh-race-glow-1" />
      <div className="toh-race-glow-2" />
      <div className="toh-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="toh-race-top-row">
          <div className="toh-live-badge" style={{ cursor: view === 'race' ? 'default' : 'pointer' }}>
            <span className="toh-live-dot" style={{
              background: connLive ? '#4ade80' : 'rgba(255,255,255,0.2)',
              animation: connLive ? undefined : 'none',
            }} />
            {connStatus}
          </div>
          {view === 'race' && (
            <button
              onClick={goBackToRaces}
              style={{
                fontSize: 12,
                color: 'var(--dim)',
                padding: '8px 14px',
                border: '1px solid var(--toh-border)',
                borderRadius: 8,
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ← Back
            </button>
          )}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
          fontSize: 'clamp(42px, 6vw, 72px)',
          fontWeight: 700,
          lineHeight: 1,
          color: '#fff',
          letterSpacing: '-0.05em',
          marginBottom: 10,
        }}>
          Race Mode <span style={{ color: 'var(--indigo)' }}>Live</span>
        </h1>
        <p style={{
          fontSize: 17,
          color: 'rgba(229, 231, 239, 0.78)',
          lineHeight: 1.8,
          maxWidth: 520,
          marginBottom: 40,
        }}>
          Watch players race in real-time. Every tower logged in Discord instantly moves the progress bar.
        </p>

        {/* ═══ CREDS PANEL ═══ */}
        {view === 'creds' && (
          <div className="toh-creds-panel">
            <div className="toh-creds-title">Connect to your race database</div>
            <div className="toh-creds-subtitle">
              Enter your Supabase credentials to watch live. These are saved in your browser session.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label className="toh-field-label">Supabase URL</label>
                <input
                  className="toh-race-input"
                  type="text"
                  placeholder="https://xxxx.supabase.co"
                  value={sbUrl}
                  onChange={e => setSbUrl(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="toh-field-label">
                  Anon Key <span style={{ color: '#4ade80', textTransform: 'none', fontWeight: 500 }}>— public, safe to enter</span>
                </label>
                <input
                  className="toh-race-input"
                  type="password"
                  placeholder="eyJhbGciOi…"
                  value={sbKey}
                  onChange={e => setSbKey(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <button
              className="toh-btn-primary"
              onClick={() => doConnect(sbUrl, sbKey)}
              style={{ marginTop: 4 }}
            >
              Connect →
            </button>
            <div style={{
              marginTop: 14,
              padding: '12px 16px',
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--dim)',
            }}>
              <b style={{ color: '#4ade80' }}>✓ Security note:</b> Only use the <b>anon</b> key here — it&apos;s designed to be public. Never paste your <b>service_role</b> key.
            </div>
          </div>
        )}

        {/* ═══ EMPTY STATE ═══ */}
        {view === 'empty' && (
          <div className="toh-state-box">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏁</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No Active Race</div>
            <div style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
              Start a race in Discord with <code style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--violet)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>/race_create</code>, have players join with <code style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--violet)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>/race_join</code>, then come back here to watch live.
            </div>
          </div>
        )}

        {/* ═══ SERVER PICKER ═══ */}
        {view === 'server-picker' && (
          <div className="toh-state-box">
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Choose a Server</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 20 }}>
              {serverGroups.map(s => (
                <div
                  key={s.id}
                  className="toh-server-card"
                  onClick={() => renderRacePicker(s.id)}
                >
                  <div className="toh-server-icon" style={s.icon ? { backgroundImage: `url('${s.icon}')` } : undefined}>
                    {!s.icon && s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="toh-server-info">
                    <div className="toh-server-name">{s.name}</div>
                    <div className="toh-server-count">
                      {s.raceCount} race{s.raceCount !== 1 ? 's' : ''} • {s.userCount} active player{s.userCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ RACE PICKER ═══ */}
        {view === 'race-picker' && (
          <div className="toh-state-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
              <button
                onClick={() => renderServerPicker()}
                style={{ fontSize: 12, color: 'var(--dim)', padding: '6px 12px', border: '1px solid var(--toh-border)', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}
              >
                ← Servers
              </button>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                Races in {filteredRacesForPicker[0]?.guild_name || 'Unknown Server'}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 10 }}>
              {filteredRacesForPicker.map(r => (
                <div
                  key={r.id}
                  className="toh-race-select-card"
                  onClick={() => selectRace(r)}
                >
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, fontWeight: 700, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                    {r.short_id}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 16 }}>{r.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dim)' }}>
                    <span>{r.status.toUpperCase()}</span>
                    <span>{r.goal_type === 'average' ? 'Average Mode' : 'Standard Mode'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ERROR STATE ═══ */}
        {view === 'error' && (
          <div style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            marginTop: 16,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 6 }}>{errorTitle}</div>
            <div style={{ fontSize: 14, color: 'var(--dim)' }}>{errorMsg}</div>
          </div>
        )}

        {/* ═══ RACE VIEW ═══ */}
        {view === 'race' && currentRace && (
          <>
            {/* Race Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{currentRace.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  <span className={`toh-chip ${currentRace.status === 'active' ? 'live' : currentRace.status === 'waiting' ? 'waiting' : 'done'}`}>
                    {currentRace.status === 'active' && <><span className="toh-live-dot toh-pulse-prominent" /> ● LIVE</>}
                    {currentRace.status === 'waiting' && '⏳ WAITING'}
                    {currentRace.status === 'finished' && '■ DONE'}
                  </span>
                  <span className="toh-chip">ID: <b>{currentRace.short_id}</b></span>
                  <span className="toh-chip">
                    {currentRace.goal_type === 'average' ? 'Goal: 5 towers (Average Time)' : `Goal: +${Number(currentRace.goal_amount).toLocaleString()} levels`}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {currentRace.status === 'active' && startedAt && (
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--toh-border)',
                    borderRadius: 12,
                    padding: '16px 24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 20,
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Elapsed</div>
                      <div style={{
                        fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
                        fontSize: 28,
                        fontWeight: 600,
                        color: '#4ade80',
                        letterSpacing: 2,
                      }}>
                        {timerDisplay}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Racer Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sortedRacers.map((r, i) => {
                const isAvg = currentRace.goal_type === 'average';
                const xpGained = Number(r.current_xp) - Number(r.start_xp);
                const goalXP = Number(r.goal_xp) || 1;
                let pct = 0;
                if (isAvg) {
                  pct = r.finished ? 100 : 0;
                } else {
                  pct = Math.min(xpGained / goalXP * 100, 100);
                }
                const curLvl = lvlFromXP(Number(r.current_xp));
                const eta = isAvg ? (r.finished ? 'Finished' : 'Racing...') : calcETA(r, startedAt);
                const placeClass = i === 0 ? 'p1' : i === 1 ? 'p2' : i === 2 ? 'p3' : '';

                return (
                  <div
                    key={r.user_id}
                    className={`toh-racer-card toh-racer-enter ${placeClass} ${r.finished ? 'done' : ''}`}
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 22, flexShrink: 0, width: 30, textAlign: 'center' }}>
                        {medals[i] || (i + 1)}
                      </div>
                      <div className="toh-racer-avatar" style={{
                        backgroundImage: r.avatar_url ? `url('${r.avatar_url}')` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}>
                        {!r.avatar_url && (r.display_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.display_name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--dim)', fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace' }}>
                          Level {curLvl.toLocaleString()}
                        </div>
                      </div>
                      {r.finished && (
                        <span className="toh-racer-finished-badge">✓ Done</span>
                      )}
                      {!r.finished && currentRace.status === 'active' && (
                        <span style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.25)',
                          borderRadius: 20,
                          padding: '3px 10px',
                          fontSize: 11,
                          color: '#4ade80',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}>
                          Racing...
                        </span>
                      )}
                      {!r.finished && currentRace.status === 'waiting' && (
                        <span style={{
                          background: 'rgba(234, 179, 8, 0.1)',
                          border: '1px solid rgba(234, 179, 8, 0.25)',
                          borderRadius: 20,
                          padding: '3px 10px',
                          fontSize: 11,
                          color: '#facc15',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}>
                          Waiting
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        color: 'var(--dim)',
                        fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
                        marginBottom: 6,
                      }}>
                        <span>
                          {isAvg
                            ? <>Avg Time: <b style={{ color: '#fff' }}>{r.current_average ? fmtTime(r.current_average) : '—'}</b></>
                            : <>XP: <b style={{ color: '#fff' }}>{fmtXP(xpGained)}</b> / <span>{fmtXP(goalXP)}</span></>
                          }
                        </span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>
                          {isAvg ? (r.finished ? '100%' : 'In Progress') : `${pct.toFixed(1)}%`}
                        </span>
                      </div>
                      <div className="toh-progress-track">
                        <div
                          className={`toh-progress-fill ${pct >= 100 ? 'complete' : ''} ${!r.finished && currentRace.status === 'active' ? 'racing' : ''}`}
                          style={{
                            width: `${pct}%`,
                            transition: 'width 0.7s cubic-bezier(0.34, 1.4, 0.64, 1)',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span className="toh-stat-pill">Start: <b>{Number(r.start_level).toLocaleString()}</b></span>
                      <span className="toh-stat-pill">ETA: <b>{eta}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Activity Log */}
            {logs.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: 'var(--dim)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  Activity Log
                  <span style={{ flex: 1, height: 1, background: 'var(--toh-border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                  {logs.map((log, idx) => {
                    const t = new Date(log.logged_at);
                    const ts = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
                    const detail = log.log_type === 'towers'
                      ? `won ${log.towers_won} ${log.tower_type} tower${log.towers_won !== 1 ? 's' : ''}`
                      : log.log_type === 'time'
                        ? `completed tower in ${fmtTime(log.completion_time || 0)}`
                        : `updated to level ${Number(log.new_level || 0).toLocaleString()}`;

                    return (
                      <div key={log.id || idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 14px',
                        background: 'var(--surface)',
                        border: '1px solid var(--toh-border)',
                        borderRadius: 10,
                        fontSize: 13,
                        animation: idx === 0 ? 'toh-log-in 0.25s ease both' : undefined,
                      }}>
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--dim)', whiteSpace: 'nowrap' }}>{ts}</span>
                        <span style={{ fontWeight: 600, color: 'var(--violet)', whiteSpace: 'nowrap' }}>{log.username}</span>
                        <span style={{ color: 'var(--dim)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail}</span>
                        {log.log_type !== 'time' && log.xp_gained && (
                          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: '#4ade80', whiteSpace: 'nowrap' }}>+{fmtXP(log.xp_gained)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Log-in animation keyframes (inline) */}
      <style jsx>{`
        @keyframes toh-log-in {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
