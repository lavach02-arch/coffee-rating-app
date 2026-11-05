import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating component supporting both interactive rating and read-only display.
 */
export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 18,
  interactive = false,
  onRate = null,
  showValue = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (starIndex) => {
    if (interactive && onRate) {
      onRate(starIndex);
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (interactive) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const activeRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="star-rating-container" onMouseLeave={handleMouseLeave}>
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = activeRating >= starValue;
        const isHalf = !isFilled && activeRating >= starValue - 0.5 && !interactive;

        return (
          <span
            key={i}
            className={`star-icon-wrapper ${interactive ? 'interactive' : ''}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            style={{ cursor: interactive ? 'pointer' : 'default', display: 'inline-flex' }}
            title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} stars`}
          >
            {isFilled ? (
              <Star
                size={size}
                className="star-icon star-filled"
                fill="#f59e0b"
                stroke="#f59e0b"
              />
            ) : isHalf ? (
              <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
                <Star
                  size={size}
                  className="star-icon star-empty"
                  stroke="#cbd5e1"
                  fill="transparent"
                  style={{ position: 'absolute', left: 0, top: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '50%',
                    overflow: 'hidden',
                  }}
                >
                  <Star
                    size={size}
                    className="star-icon star-filled"
                    fill="#f59e0b"
                    stroke="#f59e0b"
                  />
                </span>
              </span>
            ) : (
              <Star
                size={size}
                className="star-icon star-empty"
                stroke="#cbd5e1"
                fill="transparent"
              />
            )}
          </span>
        );
      })}

      {showValue && (
        <span style={{ marginLeft: 6, fontWeight: 700, fontSize: '0.9rem', color: '#1b120c' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
