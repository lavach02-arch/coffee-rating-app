import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import CoffeeCard from './components/CoffeeCard';
import VoteModal from './components/VoteModal';
import Leaderboard from './components/Leaderboard';
import StatisticsSection from './components/StatisticsSection';
import AboutSection from './components/AboutSection';
import Toast from './components/Toast';
import Footer from './components/Footer';
import {
  getCoffees,
  getLeaderboard,
  getStatistics,
  getOrigins,
  submitVote,
  getLocalUserVotes,
} from './services/api';
import { Coffee, RotateCcw, Loader2 } from 'lucide-react';
import './styles/App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Coffee list and filter states
  const [coffees, setCoffees] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('all');
  const [selectedRoast, setSelectedRoast] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Leaderboard & platform stats
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);

  // User persistent vote cache
  const [userVotes, setUserVotes] = useState(() => getLocalUserVotes());

  // Modal & Toast states
  const [votingCoffee, setVotingCoffee] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load static filter origins once
  useEffect(() => {
    getOrigins()
      .then((res) => {
        if (res.success && res.origins) setOrigins(res.origins);
      })
      .catch((err) => console.warn('Could not load origins:', err));
  }, []);

  // Fetch Coffees based on active filters
  const loadCoffees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCoffees({
        search,
        origin: selectedOrigin,
        roast: selectedRoast,
        sortBy,
        order: 'desc',
      });
      if (res.success) {
        setCoffees(res.coffees);
      }
    } catch (err) {
      console.error('Failed to load coffees:', err);
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedOrigin, selectedRoast, sortBy]);

  useEffect(() => {
    loadCoffees();
  }, [loadCoffees]);

  // Load Leaderboard and Stats
  const refreshAggregates = useCallback(async () => {
    try {
      const [lbRes, statsRes] = await Promise.all([
        getLeaderboard(10),
        getStatistics(),
      ]);

      if (lbRes.success) setLeaderboard(lbRes.leaderboard);
      if (statsRes.success) setStats(statsRes);
    } catch (err) {
      console.warn('Failed to load aggregates:', err);
    }
  }, []);

  useEffect(() => {
    refreshAggregates();
  }, [refreshAggregates]);

  // Handle Vote Submission
  const handleVoteSubmit = async (coffeeId, rating) => {
    setIsSubmittingVote(true);
    try {
      const response = await submitVote(coffeeId, rating);

      // Update local state without page refresh
      setUserVotes((prev) => ({
        ...prev,
        [coffeeId]: rating,
      }));

      // Update coffees list state in-place
      setCoffees((prev) =>
        prev.map((c) =>
          c.id === coffeeId
            ? {
                ...c,
                rating: response.coffee.rating,
                votes: response.coffee.votes,
                has_voted: true,
                user_rating: rating,
              }
            : c
        )
      );

      // Close modal
      setVotingCoffee(null);

      // Refresh leaderboard and platform statistics immediately
      refreshAggregates();

      // Show success toast
      addToast(
        'success',
        'Vote Recorded!',
        response.message || `Thank you for rating ${response.coffee?.name} ${rating} stars!`
      );
    } catch (err) {
      if (err.status === 409) {
        addToast('warning', 'Already Voted', 'You have already submitted a vote for this coffee blend.');
      } else {
        addToast('error', 'Vote Failed', err.message || 'Could not record vote.');
      }
      throw err;
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedOrigin('all');
    setSelectedRoast('all');
    setSortBy('rating');
  };

  const scrollToExplore = () => {
    setActiveTab('explore');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const scrollToLeaderboard = () => {
    setActiveTab('leaderboard');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stats={stats}
      />

      <main>
        {/* Home Tab: Hero + Overview + Gallery Preview */}
        {activeTab === 'home' && (
          <>
            <Hero
              stats={stats}
              onExploreClick={scrollToExplore}
              onLeaderboardClick={scrollToLeaderboard}
            />

            <FilterBar
              search={search}
              setSearch={setSearch}
              selectedOrigin={selectedOrigin}
              setSelectedOrigin={setSelectedOrigin}
              selectedRoast={selectedRoast}
              setSelectedRoast={setSelectedRoast}
              sortBy={sortBy}
              setSortBy={setSortBy}
              origins={origins}
              onReset={handleResetFilters}
            />

            {/* Coffee Gallery */}
            <section className="gallery-section">
              <div className="container">
                <div className="gallery-header">
                  <div>
                    <h2 className="gallery-title">Coffee Gallery</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      Browse top blends, filter by origin or roast, and cast your rating.
                    </p>
                  </div>
                  <span className="gallery-count">
                    Showing <strong>{coffees.length}</strong> {coffees.length === 1 ? 'blend' : 'blends'}
                  </span>
                </div>

                {loading ? (
                  <div className="coffee-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="skeleton-card" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="empty-state">
                    <Coffee className="empty-state-icon" />
                    <h3 className="empty-state-title">Backend Connection Required</h3>
                    <p className="empty-state-text">
                      Could not reach the Flask API server. Please ensure the backend is running.
                    </p>
                    <button className="btn btn-primary" onClick={loadCoffees}>
                      <RotateCcw size={16} /> Retry Connection
                    </button>
                  </div>
                ) : coffees.length === 0 ? (
                  <div className="empty-state">
                    <Coffee className="empty-state-icon" />
                    <h3 className="empty-state-title">No matching coffees found</h3>
                    <p className="empty-state-text">
                      Try adjusting your search criteria, selecting a different origin, or clearing filters.
                    </p>
                    <button className="btn btn-secondary" onClick={handleResetFilters}>
                      <RotateCcw size={16} /> Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="coffee-grid">
                    {coffees.map((coffee) => (
                      <CoffeeCard
                        key={coffee.id}
                        coffee={coffee}
                        onVoteClick={setVotingCoffee}
                        userVotedRating={userVotes[coffee.id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Embedded Leaderboard */}
            <Leaderboard
              leaderboard={leaderboard}
              onVoteClick={setVotingCoffee}
              userVotes={userVotes}
            />

            {/* Platform Analytics */}
            <StatisticsSection stats={stats} />
          </>
        )}

        {/* Explore Tab: Focus on Coffee Directory */}
        {activeTab === 'explore' && (
          <div style={{ paddingTop: 30 }}>
            <div className="container" style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>Explore Specialty Coffees</h1>
              <p>Discover roasts from renowned coffee-producing regions around the globe.</p>
            </div>

            <FilterBar
              search={search}
              setSearch={setSearch}
              selectedOrigin={selectedOrigin}
              setSelectedOrigin={setSelectedOrigin}
              selectedRoast={selectedRoast}
              setSelectedRoast={setSelectedRoast}
              sortBy={sortBy}
              setSortBy={setSortBy}
              origins={origins}
              onReset={handleResetFilters}
            />

            <section className="gallery-section">
              <div className="container">
                <div className="gallery-header">
                  <h2 className="gallery-title">Available Blends</h2>
                  <span className="gallery-count">
                    Showing <strong>{coffees.length}</strong> coffees
                  </span>
                </div>

                {loading ? (
                  <div className="coffee-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="skeleton-card" />
                    ))}
                  </div>
                ) : coffees.length === 0 ? (
                  <div className="empty-state">
                    <Coffee className="empty-state-icon" />
                    <h3 className="empty-state-title">No coffees match your filter</h3>
                    <p className="empty-state-text">
                      Try selecting another roast or clearing search terms.
                    </p>
                    <button className="btn btn-secondary" onClick={handleResetFilters}>
                      <RotateCcw size={16} /> Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="coffee-grid">
                    {coffees.map((coffee) => (
                      <CoffeeCard
                        key={coffee.id}
                        coffee={coffee}
                        onVoteClick={setVotingCoffee}
                        userVotedRating={userVotes[coffee.id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div style={{ paddingTop: 30 }}>
            <Leaderboard
              leaderboard={leaderboard}
              onVoteClick={setVotingCoffee}
              userVotes={userVotes}
            />
            <StatisticsSection stats={stats} />
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div style={{ paddingTop: 30 }}>
            <StatisticsSection stats={stats} />
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div style={{ paddingTop: 30 }}>
            <AboutSection />
          </div>
        )}
      </main>

      {/* Interactive Vote Modal */}
      {votingCoffee && (
        <VoteModal
          coffee={votingCoffee}
          onClose={() => setVotingCoffee(null)}
          onSubmitVote={handleVoteSubmit}
          isSubmitting={isSubmittingVote}
        />
      )}

      {/* Floating Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <Footer onSelectTab={setActiveTab} />
    </div>
  );
}
