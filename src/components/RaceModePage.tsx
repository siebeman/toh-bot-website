'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

type RacePhase = 'idle' | 'countdown' | 'racing' | 'finished';

interface RacerState {
  name: string;
  level: number;
  progress: number;
  status: 'waiting' | 'racing' | 'done';
  time: string;
  finishMs: number | null;
  speed: number;
}

const INITIAL_RACERS: RacerState[] = [
  { name: 'Skyourain', level: 1341, progress: 0, status: 'waiting', time: '-', finishMs: null, speed: 0 },
  { name: 'wilder270522', level: 1067, progress: 0, status: 'waiting', time: '-', finishMs: null, speed: 0 },
  { name: 'chatgris31', level: 933, progress: 0, status: 'waiting', time: '-', finishMs: null, speed: 0 },
  { name: 'RealMorri', level: 900, progress: 0, status: 'waiting', time: '-', finishMs: null, speed: 0 },
];

const MOCK_HISTORY = [
  { date: 'Mar 4, 2026', winner: 'Skyourain', racers: 6, bestTime: '2:14', avatar: 'S' },
  { date: 'Mar 3, 2026', winner: 'wilder270522', racers: 4, bestTime: '2:38', avatar: 'W' },
  { date: 'Mar 2, 2026', winner: 'chatgris31', racers: 8, bestTime: '3:01', avatar: 'C' },
  { date: 'Mar 1, 2026', winner: 'RealMorri', racers: 5, bestTime: '2:52', avatar: 'R' },
];

const MOCK_STATS = [
  { icon: '🏁', value: '1,247', label: 'Total Races', className: 'races' },
  { icon: '⏱️', value: '4:32', label: 'Avg Finish Time', className: 'time' },
  { icon: '🏆', value: 'Skyourain — 89', label: 'Most Wins', className: 'wins' },
];

const SPEED_OPTIONS = [1, 2, 3] as const;

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frac = Math.floor((ms % 1000) / 100);
  return `${min}:${String(sec).padStart(2, '0')}.${frac}`;
}

export default function RaceModePage() {
  const [seconds, setSeconds] = useState(227);
  const [tick, setTick] = useState(0);
  const [phase, setPhase] = useState<RacePhase>('idle');
  const [countdownNum, setCountdownNum] = useState(3);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 3>(1);
  const [racers, setRacers] = useState<RacerState[]>(INITIAL_RACERS);
  const [raceStartTime, setRaceStartTime] = useState<number>(0);
  const [finishedOrder, setFinishedOrder] = useState<string[]>([]);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const resetRace = useCallback(() => {
    if (animRef.current) {
      clearInterval(animRef.current);
      animRef.current = null;
    }
    setPhase('idle');
    setCountdownNum(3);
    setRacers(INITIAL_RACERS.map(r => ({ ...r, progress: 0, status: 'waiting', time: '-', finishMs: null, speed: 0 })));
    setFinishedOrder([]);
    setRaceStartTime(0);
  }, []);

  const startRace = useCallback(() => {
    resetRace();
    setPhase('countdown');
    setCountdownNum(3);

    // Countdown sequence
    let count = 3;
    const countInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else if (count === 0) {
        setCountdownNum(0);
        clearInterval(countInterval);

        // Start the race
        const startTime = Date.now();
        setRaceStartTime(startTime);
        setPhase('racing');

        // Assign random speeds to each racer
        const newRacers = INITIAL_RACERS.map(r => ({
          ...r,
          progress: 0,
          status: 'racing' as const,
          time: '-',
          finishMs: null,
          speed: 0.3 + Math.random() * 0.7, // base speed between 0.3-1.0 per tick
        }));
        setRacers(newRacers);
        setFinishedOrder([]);

        // Animation loop
        const intervalMs = 50;
        const order: string[] = [];

        animRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;

          setRacers(prev => {
            const updated = prev.map(racer => {
              if (racer.status === 'done') return racer;

              // Randomized pace: base speed + small random jitter each tick
              const jitter = 0.5 + Math.random() * 1.0;
              const increment = racer.speed * jitter * speedMultiplier * (intervalMs / 50);
              const newProgress = Math.min(100, racer.progress + increment);

              if (newProgress >= 100) {
                order.push(racer.name);
                return {
                  ...racer,
                  progress: 100,
                  status: 'done' as const,
                  time: formatMs(elapsed),
                  finishMs: elapsed,
                };
              }

              return { ...racer, progress: newProgress };
            });

            // Check if all finished
            if (updated.every(r => r.status === 'done')) {
              if (animRef.current) {
                clearInterval(animRef.current);
                animRef.current = null;
              }
              setPhase('finished');
            }

            return updated;
          });

          setFinishedOrder([...order]);
        }, intervalMs);
      }
    }, 800);
  }, [resetRace, speedMultiplier]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  const positionColors: Record<number, string> = {
    1: 'rgba(255, 215, 0, 0.2)',
    2: 'rgba(192, 192, 192, 0.15)',
    3: 'rgba(205, 127, 50, 0.15)',
    4: 'rgba(139, 124, 246, 0.1)',
  };

  const positionBorders: Record<number, string> = {
    1: 'rgba(255, 215, 0, 0.3)',
    2: 'rgba(192, 192, 192, 0.25)',
    3: 'rgba(205, 127, 50, 0.25)',
    4: 'rgba(139, 124, 246, 0.15)',
  };

  const positionLabels: Record<number, string> = {
    1: '1st',
    2: '2nd',
    3: '3rd',
    4: '4th',
  };

  // Compute position for each racer based on finishedOrder and current progress
  const getRacerPosition = (name: string): number => {
    const finishedIdx = finishedOrder.indexOf(name);
    if (finishedIdx !== -1) return finishedIdx + 1;
    // For non-finished racers, sort by progress descending
    const activeRacers = racers
      .filter(r => r.status !== 'done')
      .sort((a, b) => b.progress - a.progress);
    const idx = activeRacers.findIndex(r => r.name === name);
    return finishedOrder.length + idx + 1;
  };

  const statusLabel = phase === 'idle' ? 'Ready' : phase === 'countdown' ? 'Countdown...' : phase === 'racing' ? 'Racing!' : 'Race Complete';

  return (
    <section className="toh-race-hero">
      <div className="toh-race-glow-1" />
      <div className="toh-race-glow-2" />
      <div className="toh-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="toh-live-badge">
          <span className="toh-live-dot toh-pulse-prominent" />
          Race Mode Live
        </div>
        <h1 style={{
          fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
          fontSize: 'clamp(42px, 6vw, 72px)',
          fontWeight: 700,
          lineHeight: 1,
          color: '#fff',
          letterSpacing: '-0.05em',
          marginBottom: '22px',
        }}>
          Race Mode
        </h1>
        <p style={{
          fontSize: 17,
          color: 'rgba(229, 231, 239, 0.78)',
          lineHeight: 1.8,
          maxWidth: 560,
          marginBottom: 40,
        }}>
          Compete head-to-head in real-time tower climbing races. Create a race, invite players, and see who reaches the top first.
        </p>

        {/* Info panel */}
        <div className="toh-creds-panel">
          <div className="toh-creds-title">🏁 How Race Mode Works</div>
          <div className="toh-creds-subtitle">
            Race mode allows server members to compete in real-time climbing challenges.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div style={{
              padding: 16,
              background: 'var(--surface2)',
              borderRadius: 16,
              border: '1px solid var(--toh-border)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>1️⃣</div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4, fontSize: 14 }}>Create a Race</div>
              <div style={{ fontSize: 13, color: 'var(--dim)' }}>
                Use <code style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--violet)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>/race create</code> to start a new race.
              </div>
            </div>
            <div style={{
              padding: 16,
              background: 'var(--surface2)',
              borderRadius: 16,
              border: '1px solid var(--toh-border)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>2️⃣</div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4, fontSize: 14 }}>Players Join</div>
              <div style={{ fontSize: 13, color: 'var(--dim)' }}>
                Other players join with <code style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--violet)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>/race join</code>.
              </div>
            </div>
            <div style={{
              padding: 16,
              background: 'var(--surface2)',
              borderRadius: 16,
              border: '1px solid var(--toh-border)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>3️⃣</div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4, fontSize: 14 }}>Race & Win</div>
              <div style={{ fontSize: 13, color: 'var(--dim)' }}>
                Climb the tower! First to finish wins. Bot tracks everything automatically.
              </div>
            </div>
          </div>
        </div>

        {/* Demo Race Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#fff',
          }}>
            Demo Race
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`toh-race-status ${phase}`}>
              {phase === 'racing' && <span className="toh-live-dot toh-pulse-prominent" />}
              {statusLabel}
            </span>
            <span className="toh-chip">4 Racers</span>
            {phase === 'idle' && <span className="toh-chip waiting">Ready to race</span>}
            {phase === 'racing' && <span className="toh-chip live toh-pulse-prominent-wrap"><span className="toh-live-dot toh-pulse-prominent" /> In Progress</span>}
            {phase === 'finished' && <span className="toh-chip" style={{ background: 'rgba(139, 124, 246, 0.1)', borderColor: 'rgba(139, 124, 246, 0.25)', color: 'var(--violet)' }}>Complete</span>}
          </div>
        </div>

        {/* Race Controls */}
        <div className="toh-race-controls">
          <div className="toh-race-controls-left">
            <span className="toh-race-controls-label">Race Controls</span>
            <button
              className="toh-race-btn-start"
              onClick={startRace}
              disabled={phase === 'countdown' || phase === 'racing'}
            >
              ▶ Start Race
            </button>
            <button
              className="toh-race-btn-reset"
              onClick={resetRace}
              disabled={phase === 'idle'}
            >
              ↺ Reset
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--dim)', fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace' }}>Speed</span>
            <div className="toh-race-speed-group">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`toh-race-speed-btn ${speedMultiplier === s ? 'active' : ''}`}
                  onClick={() => setSpeedMultiplier(s)}
                  disabled={phase === 'racing' || phase === 'countdown'}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timer with live animation */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--toh-border)',
          borderRadius: 12,
          padding: '16px 24px',
          marginBottom: 28,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Elapsed
          </div>
          <div
            className={`toh-timer ${tick % 2 === 0 ? 'toh-timer-pulse' : ''}`}
            style={{
              fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
              fontSize: 28,
              fontWeight: 600,
              color: phase === 'racing' ? '#4ade80' : 'var(--indigo)',
              letterSpacing: 2,
              transition: 'transform 0.15s ease, color 0.3s ease',
            }}
          >
            {timerDisplay}
          </div>
        </div>

        {/* Racer Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {racers.map((racer, i) => {
            const pos = getRacerPosition(racer.name);
            return (
              <div
                key={racer.name}
                className="toh-racer-card toh-racer-enter"
                style={{
                  animationDelay: `${i * 120}ms`,
                  borderColor: racer.status === 'done' ? positionBorders[pos] || undefined : undefined,
                  background: pos === 1 && racer.status === 'done' ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.03), var(--surface))' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div className="toh-position-badge" style={{
                    background: racer.status === 'done' ? positionColors[pos] : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${racer.status === 'done' ? (positionBorders[pos] || 'var(--toh-border)') : 'var(--toh-border)'}`,
                  }}>
                    {positionLabels[pos] || `${pos}th`}
                  </div>
                  <div className="toh-racer-avatar">
                    {racer.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>{racer.name}</div>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--dim)',
                      fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
                    }}>
                      Level {racer.level}
                    </div>
                  </div>
                  {racer.status === 'done' && (
                    <span className="toh-racer-finished-badge">
                      ✓ FINISHED ({racer.time})
                    </span>
                  )}
                  {racer.status === 'racing' && (
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
                  {racer.status === 'waiting' && (
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
                    <span>Progress</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(racer.progress)}%</span>
                  </div>
                  <div className="toh-progress-track">
                    <div
                      className={`toh-progress-fill ${racer.progress >= 100 ? 'complete' : ''} ${racer.status === 'racing' ? 'racing' : ''}`}
                      style={{ width: `${racer.progress}%`, transition: racer.status === 'racing' ? 'width 0.05s linear' : 'width 0.7s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="toh-stat-pill">Floor <b>{Math.min(12, Math.floor(racer.progress / 100 * 12))}/12</b></span>
                  <span className="toh-stat-pill">Time <b>{racer.time}</b></span>
                  <span className="toh-stat-pill">Pos <b>#{pos}</b></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Race Results Summary */}
        {phase === 'finished' && (
          <div className="toh-race-results">
            <div className="toh-race-results-title">
              🏁 Race Results
            </div>
            <div className="toh-race-results-grid">
              {racers
                .filter(r => r.finishMs !== null)
                .sort((a, b) => (a.finishMs ?? 0) - (b.finishMs ?? 0))
                .map((racer, idx) => (
                  <div key={racer.name} className="toh-race-result-item">
                    <div className={`toh-race-result-pos ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'other'}`}>
                      {idx + 1}
                    </div>
                    <div className="toh-race-result-name">{racer.name}</div>
                    <div className="toh-race-result-time">{racer.time}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Race History */}
        <div className="toh-race-history">
          <div className="toh-race-history-title">
            📜 Race History
          </div>
          <div className="toh-race-history-grid">
            {MOCK_HISTORY.map((race, i) => (
              <div key={i} className="toh-race-history-card">
                <div className="toh-race-history-date">{race.date}</div>
                <div className="toh-race-history-winner">
                  <div className="toh-race-history-winner-avatar">{race.avatar}</div>
                  <div className="toh-race-history-winner-name">{race.winner}</div>
                </div>
                <div className="toh-race-history-meta">
                  <span className="toh-race-history-meta-item">Racers: <b>{race.racers}</b></span>
                  <span className="toh-race-history-meta-item">Best: <b>{race.bestTime}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Race Statistics */}
        <div className="toh-race-stats">
          <div className="toh-race-stats-title">
            📊 Race Statistics
          </div>
          <div className="toh-race-stats-grid">
            {MOCK_STATS.map((stat, i) => (
              <div key={i} className="toh-race-stat-card">
                <div className={`toh-race-stat-icon ${stat.className}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="toh-race-stat-value">{stat.value}</div>
                  <div className="toh-race-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {phase === 'countdown' && (
        <div className="toh-countdown-overlay">
          {countdownNum > 0 ? (
            <div key={countdownNum} className="toh-countdown-number">
              {countdownNum}
            </div>
          ) : (
            <div key="go" className="toh-countdown-go">
              GO!
            </div>
          )}
        </div>
      )}
    </section>
  );
}
