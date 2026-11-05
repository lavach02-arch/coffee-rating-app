import React from 'react';
import { Search, X, ChevronDown, RotateCcw, Filter } from 'lucide-react';

export default function FilterBar({
  search,
  setSearch,
  selectedOrigin,
  setSelectedOrigin,
  selectedRoast,
  setSelectedRoast,
  sortBy,
  setSortBy,
  origins = [],
  onReset,
}) {
  const hasActiveFilters = search || (selectedOrigin && selectedOrigin !== 'all') || (selectedRoast && selectedRoast !== 'all') || sortBy !== 'rating';

  const roasts = [
    { key: 'all', label: 'All Roasts' },
    { key: 'Light', label: 'Light' },
    { key: 'Medium', label: 'Medium' },
    { key: 'Dark', label: 'Dark' },
  ];

  return (
    <section className="filter-section">
      <div className="container">
        <div className="filter-card">
          {/* Top Row: Search and Select Dropdowns */}
          <div className="filter-row-top">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search coffee name, origin, or flavor notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filter-dropdown-group">
              {/* Origin Dropdown */}
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                >
                  <option value="all">All Origins ({origins.length})</option>
                  {origins.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>

              {/* Sort By Dropdown */}
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Sort: Highest Rating</option>
                  <option value="votes">Sort: Most Votes</option>
                  <option value="name">Sort: Name (A-Z)</option>
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>
          </div>

          {/* Bottom Row: Roast Level Pills & Clear Button */}
          <div className="filter-row-bottom">
            <div className="roast-pills-group">
              <span className="roast-pills-label">
                <Filter size={14} style={{ display: 'inline', marginRight: 4 }} />
                Roast Profile:
              </span>
              {roasts.map((r) => (
                <button
                  key={r.key}
                  className={`roast-pill ${selectedRoast === r.key ? 'active' : ''}`}
                  onClick={() => setSelectedRoast(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button className="filter-reset-btn" onClick={onReset}>
                <RotateCcw size={14} />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
