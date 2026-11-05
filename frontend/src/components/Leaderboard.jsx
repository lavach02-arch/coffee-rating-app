import React from 'react';
import { Trophy, Award, Medal, Star, MapPin, Coffee, Check } from 'lucide-react';
import StarRating from './StarRating';

export default function Leaderboard({ leaderboard = [], onVoteClick, userVotes = {} }) {
  const topThree = leaderboard.slice(0, 3);
  const remainingRankings = leaderboard.slice(3, 10);

  const getPodiumBadge = (rank) => {
    switch (rank) {
      case 1:
        return <div className="podium-badge podium-badge-1"><Trophy size={18} /></div>;
      case 2:
        return <div className="podium-badge podium-badge-2"><Medal size={18} /></div>;
      case 3:
        return <div className="podium-badge podium-badge-3"><Award size={18} /></div>;
      default:
        return null;
    }
  };

  const getRankPill = (rank) => {
    switch (rank) {
      case 1:
        return <span className="rank-pill rank-pill-1">1</span>;
      case 2:
        return <span className="rank-pill rank-pill-2">2</span>;
      case 3:
        return <span className="rank-pill rank-pill-3">3</span>;
      default:
        return <span className="rank-pill rank-pill-default">{rank}</span>;
    }
  };

  const getRoastBadgeClass = (roast) => {
    switch (roast?.toLowerCase()) {
      case 'light':
        return 'badge-light';
      case 'dark':
        return 'badge-dark';
      default:
        return 'badge-medium';
    }
  };

  return (
    <section className="leaderboard-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Hall of Fame</span>
          <h2 className="section-title">Top-Rated Coffee Leaderboard</h2>
          <p className="section-subtitle">
            The community's highest-rated coffee selections. Rankings are determined by average rating,
            with total vote count used as the secondary sorting criterion.
          </p>
        </div>

        {/* Podium for Top 3 */}
        {topThree.length >= 3 && (
          <div className="podium-container">
            {/* Rank 2 (Silver) */}
            <div className="podium-card podium-second">
              {getPodiumBadge(2)}
              <span className={`badge ${getRoastBadgeClass(topThree[1].roast)}`}>
                {topThree[1].roast}
              </span>
              <h3 className="podium-coffee-title">{topThree[1].name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-caramel-400)', fontWeight: 600, marginBottom: 8 }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                {topThree[1].origin}
              </p>
              <div className="podium-score">
                {Number(topThree[1].rating).toFixed(1)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <StarRating rating={topThree[1].rating} size={16} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: 16 }}>
                {topThree[1].votes.toLocaleString()} verified votes
              </p>
              {userVotes[topThree[1].id] || topThree[1].has_voted ? (
                <span className="badge badge-medium" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <Check size={12} /> Rated
                </span>
              ) : (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onVoteClick(topThree[1])}
                >
                  <Star size={14} /> Rate
                </button>
              )}
            </div>

            {/* Rank 1 (Gold - Center) */}
            <div className="podium-card podium-first">
              {getPodiumBadge(1)}
              <span className={`badge ${getRoastBadgeClass(topThree[0].roast)}`}>
                👑 Crown Favorite • {topThree[0].roast}
              </span>
              <h3 className="podium-coffee-title" style={{ fontSize: '1.5rem' }}>
                {topThree[0].name}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-caramel-400)', fontWeight: 600, marginBottom: 8 }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
                {topThree[0].origin}
              </p>
              <div className="podium-score" style={{ fontSize: '2.8rem', color: '#854d0e' }}>
                {Number(topThree[0].rating).toFixed(1)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <StarRating rating={topThree[0].rating} size={20} />
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-light)', marginBottom: 18 }}>
                {topThree[0].votes.toLocaleString()} community votes
              </p>
              {userVotes[topThree[0].id] || topThree[0].has_voted ? (
                <span className="badge badge-medium" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <Check size={14} /> Rated by You
                </span>
              ) : (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onVoteClick(topThree[0])}
                >
                  <Star size={14} fill="currentColor" /> Rate Champion
                </button>
              )}
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="podium-card podium-third">
              {getPodiumBadge(3)}
              <span className={`badge ${getRoastBadgeClass(topThree[2].roast)}`}>
                {topThree[2].roast}
              </span>
              <h3 className="podium-coffee-title">{topThree[2].name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-caramel-400)', fontWeight: 600, marginBottom: 8 }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                {topThree[2].origin}
              </p>
              <div className="podium-score">
                {Number(topThree[2].rating).toFixed(1)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <StarRating rating={topThree[2].rating} size={16} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: 16 }}>
                {topThree[2].votes.toLocaleString()} verified votes
              </p>
              {userVotes[topThree[2].id] || topThree[2].has_voted ? (
                <span className="badge badge-medium" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <Check size={12} /> Rated
                </span>
              ) : (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onVoteClick(topThree[2])}
                >
                  <Star size={14} /> Rate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Remaining Ranks Table (4 through 10) */}
        <div className="leaderboard-table-card">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: 80, textAlign: 'center' }}>Rank</th>
                <th>Coffee Blend & Origin</th>
                <th>Roast Level</th>
                <th>Community Score</th>
                <th>Total Votes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item) => {
                const voted = userVotes[item.id] || item.has_voted;
                const ratedScore = userVotes[item.id] || item.user_rating;

                return (
                  <tr key={item.id}>
                    <td className="rank-cell">
                      {getRankPill(item.rank)}
                    </td>
                    <td>
                      <div className="coffee-name-cell">{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} />
                        {item.origin}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoastBadgeClass(item.roast)}`}>
                        {item.roast}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.1rem' }}>
                          {Number(item.rating).toFixed(1)}
                        </span>
                        <StarRating rating={item.rating} size={14} />
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        {item.votes.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {voted ? (
                        <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={14} /> Voted ({ratedScore}★)
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onVoteClick(item)}
                        >
                          <Star size={14} /> Rate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
