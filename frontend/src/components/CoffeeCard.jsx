import React from 'react';
import { MapPin, Check, Star, Coffee } from 'lucide-react';
import StarRating from './StarRating';

export default function CoffeeCard({ coffee, onVoteClick, userVotedRating }) {
  const hasVoted = Boolean(userVotedRating || coffee.has_voted);
  const userRating = userVotedRating || coffee.user_rating;

  // Split flavor notes if available
  const notes = coffee.flavor_notes
    ? coffee.flavor_notes.split(',').map((n) => n.trim())
    : ['Artisan Blend'];

  const getRoastBadgeClass = (roast) => {
    switch (roast.toLowerCase()) {
      case 'light':
        return 'badge-light';
      case 'dark':
        return 'badge-dark';
      default:
        return 'badge-medium';
    }
  };

  return (
    <div className="coffee-card">
      {/* Top Meta: Origin & Roast Badge */}
      <div className="card-top-meta">
        <div className="card-origin">
          <MapPin size={14} />
          <span>{coffee.origin}</span>
        </div>
        <span className={`badge ${getRoastBadgeClass(coffee.roast)}`}>
          {coffee.roast} Roast
        </span>
      </div>

      {/* Coffee Name */}
      <h3 className="card-title">{coffee.name}</h3>

      {/* Description */}
      <p className="card-desc">{coffee.description}</p>

      {/* Flavor Notes */}
      <div className="flavor-tags">
        {notes.slice(0, 3).map((note, index) => (
          <span key={index} className="flavor-tag">
            {note}
          </span>
        ))}
      </div>

      {/* Rating & Total Votes Row */}
      <div className="card-score-row">
        <div className="score-display">
          <span className="score-number">{Number(coffee.rating).toFixed(1)}</span>
          <div className="score-stars-col">
            <StarRating rating={coffee.rating} size={15} />
            <span className="score-votes-count">
              {coffee.votes.toLocaleString()} {coffee.votes === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button: Vote or Already Voted */}
      <div className="card-actions">
        {hasVoted ? (
          <button className="btn btn-sm vote-btn-voted" disabled>
            <Check size={16} />
            Rated {userRating} ★ by you
          </button>
        ) : (
          <button
            className="btn btn-sm btn-primary vote-btn-active"
            onClick={() => onVoteClick(coffee)}
          >
            <Star size={16} fill="currentColor" />
            Rate This Coffee
          </button>
        )}
      </div>
    </div>
  );
}
