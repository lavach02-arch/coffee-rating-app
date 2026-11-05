import React from 'react';
import { Coffee, Vote, Star, Globe, Flame } from 'lucide-react';

export default function StatisticsSection({ stats }) {
  if (!stats) return null;

  const totalRoasts = Object.values(stats.roast_distribution || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <section className="stats-section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ color: 'var(--color-caramel-300)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Live Platform Analytics
          </span>
          <h2 style={{ color: '#ffffff', fontSize: '2.2rem', marginTop: 6 }}>Coffee Community at a Glance</h2>
          <p style={{ color: '#c4afa2', maxWidth: 600, margin: '8px auto 0' }}>
            Aggregated statistics from all registered coffees and community votes across the globe.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-caramel-300)', marginBottom: 12 }}>
              <Coffee size={28} />
            </div>
            <div className="stat-box-val">{stats.total_coffees}</div>
            <div className="stat-box-lbl">Curated Blends</div>
          </div>

          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'center', color: '#10b981', marginBottom: 12 }}>
              <Vote size={28} />
            </div>
            <div className="stat-box-val">{stats.total_votes?.toLocaleString()}</div>
            <div className="stat-box-lbl">Total Community Votes</div>
          </div>

          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: 12 }}>
              <Star size={28} fill="#f59e0b" />
            </div>
            <div className="stat-box-val">{Number(stats.average_rating).toFixed(2)}</div>
            <div className="stat-box-lbl">Platform Avg Rating</div>
          </div>

          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'center', color: '#60a5fa', marginBottom: 12 }}>
              <Globe size={28} />
            </div>
            <div className="stat-box-val">{stats.origin_count}</div>
            <div className="stat-box-lbl">Distinct Countries</div>
          </div>
        </div>

        {/* Roast distribution bar */}
        {stats.roast_distribution && (
          <div
            style={{
              marginTop: 40,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5d5c8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={16} color="var(--color-caramel-300)" />
                Roast Profile Distribution
              </span>
              <span style={{ fontSize: '0.8rem', color: '#a89486' }}>
                Top Origin: <strong style={{ color: '#ffffff' }}>{stats.top_origin}</strong>
              </span>
            </div>

            {/* Distribution segments */}
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', background: '#3e271c' }}>
              <div
                style={{
                  width: `${((stats.roast_distribution.Light || 0) / totalRoasts) * 100}%`,
                  background: '#fde047',
                }}
                title={`Light: ${stats.roast_distribution.Light || 0}`}
              />
              <div
                style={{
                  width: `${((stats.roast_distribution.Medium || 0) / totalRoasts) * 100}%`,
                  background: '#ea580c',
                }}
                title={`Medium: ${stats.roast_distribution.Medium || 0}`}
              />
              <div
                style={{
                  width: `${((stats.roast_distribution.Dark || 0) / totalRoasts) * 100}%`,
                  background: '#7c2d12',
                }}
                title={`Dark: ${stats.roast_distribution.Dark || 0}`}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: '0.8rem', color: '#c4afa2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fde047' }}></span>
                <span>Light Roast: <strong>{stats.roast_distribution.Light || 0}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c' }}></span>
                <span>Medium Roast: <strong>{stats.roast_distribution.Medium || 0}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c2d12' }}></span>
                <span>Dark Roast: <strong>{stats.roast_distribution.Dark || 0}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
