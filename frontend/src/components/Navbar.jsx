import React, { useState } from 'react';
import { Coffee, Award, Sparkles, Menu, X, BarChart3, HelpCircle } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, stats }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="nav-brand" onClick={() => handleNavClick('home')}>
          <div className="nav-logo-icon">
            <Coffee size={24} />
          </div>
          <div className="nav-logo-text">
            <span className="nav-logo-title">BaristaPulse</span>
            <span className="nav-logo-tagline">Artisan Coffee Ratings</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav>
          <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <button
                className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                <Sparkles size={16} /> Home
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={() => handleNavClick('explore')}
              >
                <Coffee size={16} /> Explore Coffees
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('leaderboard')}
              >
                <Award size={16} /> Leaderboard
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => handleNavClick('stats')}
              >
                <BarChart3 size={16} /> Statistics
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
              >
                <HelpCircle size={16} /> About
              </button>
            </li>
          </ul>
        </nav>

        {/* Live Vote Counter Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {stats && (
            <div className="nav-stats-pill" title="Total Community Votes Cast">
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }}></span>
              <span><strong>{stats.total_votes?.toLocaleString() || 0}</strong> votes</span>
            </div>
          )}

          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
