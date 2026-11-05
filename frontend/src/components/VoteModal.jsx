import React, { useState } from 'react';
import { X, Star, Coffee, AlertCircle, Loader2 } from 'lucide-react';
import StarRating from './StarRating';

export default function VoteModal({ coffee, onClose, onSubmitVote, isSubmitting }) {
  const [selectedRating, setSelectedRating] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  if (!coffee) return null;

  const descriptors = {
    1: '1 Star – Mediocre / Poor Quality',
    2: '2 Stars – Fair / Commercial Grade',
    3: '3 Stars – Good / Daily Cup',
    4: '4 Stars – Excellent / High Specialty',
    5: '5 Stars – Extraordinary / Masterpiece!',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedRating < 1 || selectedRating > 5) {
      setErrorMessage('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      await onSubmitVote(coffee.id, selectedRating);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit vote. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-caramel-400)', marginBottom: 6 }}>
            <Coffee size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Submit Your Rating
            </span>
          </div>
          <h2 className="modal-coffee-name">{coffee.name}</h2>
          <p className="modal-coffee-meta">
            {coffee.origin} • {coffee.roast} Roast • Current: {coffee.rating.toFixed(1)} ★ ({coffee.votes} votes)
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-rating-picker">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              How would you score this blend?
            </span>

            {/* Interactive Stars Picker */}
            <div className="modal-stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="modal-star-btn"
                  onClick={() => setSelectedRating(star)}
                >
                  <Star
                    size={36}
                    fill={selectedRating >= star ? '#f59e0b' : 'transparent'}
                    stroke={selectedRating >= star ? '#f59e0b' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>

            <div className="rating-descriptor">
              {descriptors[selectedRating]}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Recording Vote...
                </>
              ) : (
                `Submit ${selectedRating} Star Rating`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
