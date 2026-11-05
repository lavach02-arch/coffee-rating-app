import React from 'react';
import { Coffee, Award, Star, Compass, ArrowRight } from 'lucide-react';

export default function Hero({ stats, onExploreClick, onLeaderboardClick }) {
  return (
    <section className="hero-section">
      <div className="container hero-content">
        <div className="hero-eyebrow">
          <Coffee size={14} />
          <span>Global Artisan Coffee Registry</span>
        </div>

        <h1 className="hero-title">
          Discover. Rate. <span>Explore Coffee.</span>
        </h1>

        <p className="hero-subtitle">
          Explore coffee blends from around the world and share your favorite flavors.
          Rate beans, browse origin tasting notes, and uncover the finest roasts voted by enthusiasts.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={onExploreClick}>
            <Compass size={18} />
            Explore 50+ Coffees
            <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary" onClick={onLeaderboardClick}>
            <Award size={18} />
            Top 10 Leaderboard
          </button>
        </div>

        {/* Real-time stats ribbon */}
        <div className="hero-stats-ribbon">
          <div className="hero-stat-item">
            <span className="hero-stat-value">{stats ? stats.total_coffees : '50+'}</span>
            <span className="hero-stat-label">Coffee Varieties</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value">{stats ? stats.origin_count : '20+'}</span>
            <span className="hero-stat-label">Global Origins</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value">{stats ? stats.total_votes?.toLocaleString() : '1,000+'}</span>
            <span className="hero-stat-label">Community Votes</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={20} fill="#f59e0b" stroke="#f59e0b" />
              {stats ? Number(stats.average_rating).toFixed(1) : '4.5'}
            </span>
            <span className="hero-stat-label">Average Score</span>
          </div>
        </div>
      </div>
    </section>
  );
}
