import React from 'react';
import { Coffee, Heart, Github, Award } from 'lucide-react';

export default function Footer({ onSelectTab }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand" style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: 'var(--color-caramel-300)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Coffee size={20} />
              </div>
              <h3 style={{ margin: 0 }}>BaristaPulse</h3>
            </div>
            <p style={{ color: '#a89486', fontSize: '0.9rem', lineHeight: 1.6 }}>
              The open-source interactive coffee rating directory. Empowering coffee aficionados to rate,
              discover, and explore roast profiles from micro-lots across Latin America, Africa, and Asia.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
              <li>
                <button
                  style={{ background: 'none', border: 'none', color: '#a89486', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectTab('home')}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  style={{ background: 'none', border: 'none', color: '#a89486', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectTab('explore')}
                >
                  Explore Coffees
                </button>
              </li>
              <li>
                <button
                  style={{ background: 'none', border: 'none', color: '#a89486', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectTab('leaderboard')}
                >
                  Top 10 Leaderboard
                </button>
              </li>
              <li>
                <button
                  style={{ background: 'none', border: 'none', color: '#a89486', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectTab('about')}
                >
                  About & Standards
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              Tech Stack
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: '#a89486' }}>
              <span>• React 18 + Vite</span>
              <span>• Python Flask REST API</span>
              <span>• SQLite + SQLAlchemy ORM</span>
              <span>• Pytest Automated Suite</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} BaristaPulse Coffee Rating Application. Free and Open Source.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a89486' }}>
            <span>Brewed with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>for coffee enthusiasts worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
