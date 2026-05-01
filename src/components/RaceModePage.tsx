'use client';

import React from 'react';

export default function RaceModePage() {
  const racers = [
    { name: 'Skyourain', level: 1341, progress: 100, medal: '🥇', status: 'done', time: '2:34' },
    { name: 'wilder270522', level: 1067, progress: 87, medal: '🥈', status: 'racing', time: '-' },
    { name: 'chatgris31', level: 933, progress: 72, medal: '🥉', status: 'racing', time: '-' },
    { name: 'RealMorri', level: 900, progress: 54, medal: '', status: 'racing', time: '-' },
  ];

  return (
    <section className="toh-race-hero">
      <div className="toh-race-glow-1" />
      <div className="toh-race-glow-2" />
      <div className="toh-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="toh-live-badge">
          <span className="toh-live-dot" />
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

        {/* Demo Race */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#fff',
          }}>
            Demo Race
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="toh-chip live">
              <span className="toh-live-dot" /> Live
            </span>
            <span className="toh-chip">4 Racers</span>
            <span className="toh-chip waiting">Waiting for finish</span>
          </div>
        </div>

        {/* Timer */}
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
          <div style={{
            fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--indigo)',
            letterSpacing: 2,
          }}>
            03:47
          </div>
        </div>

        {/* Racer Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {racers.map((racer, i) => (
            <div
              key={racer.name}
              className="toh-racer-card"
              style={{
                animationDelay: `${i * 0.1}s`,
                borderColor: i === 0 ? 'rgba(34, 197, 94, 0.2)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 22, width: 30, textAlign: 'center', flexShrink: 0 }}>
                  {racer.medal || `#${i + 1}`}
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
                    ✓ Finished ({racer.time})
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
                  <span style={{ color: '#fff', fontWeight: 600 }}>{racer.progress}%</span>
                </div>
                <div className="toh-progress-track">
                  <div
                    className={`toh-progress-fill ${racer.progress >= 100 ? 'complete' : ''}`}
                    style={{ width: `${racer.progress}%` }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span className="toh-stat-pill">Floor <b>12/12</b></span>
                <span className="toh-stat-pill">Time <b>{racer.time}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
