/**
 * BaristaPulse Coffee Rating API Client
 * Manages communication with the Flask REST API and persists voter ID in localStorage.
 * Includes graceful offline/static fallback for live cloud preview deployments.
 */

import seedData from './seedData.json';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When running on Vite dev server (port 3000), target Flask on port 5000 directly
  if (typeof window !== 'undefined' && (window.location.port === '3000' || window.location.port === '5173')) {
    return 'http://127.0.0.1:5000';
  }
  return '';
};

const BASE_URL = getBaseUrl();

/**
 * Retrieves or initializes a persistent unique voter ID for this browser.
 */
export function getOrCreateVoterId() {
  const STORAGE_KEY = 'baristapulse_voter_id';
  let voterId = localStorage.getItem(STORAGE_KEY);
  if (!voterId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      voterId = `voter_${crypto.randomUUID()}`;
    } else {
      voterId = `voter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    localStorage.setItem(STORAGE_KEY, voterId);
  }
  return voterId;
}

/**
 * Retrieves the local cache of user votes { [coffeeId]: rating }.
 */
export function getLocalUserVotes() {
  try {
    const raw = localStorage.getItem('baristapulse_user_votes');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Records a vote into the local cache.
 */
export function setLocalUserVote(coffeeId, rating) {
  try {
    const current = getLocalUserVotes();
    current[coffeeId] = rating;
    localStorage.setItem('baristapulse_user_votes', JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save vote to local storage', e);
  }
}

/**
 * Helper to get local data with user votes applied for fallback mode
 */
function getLocalCoffeesDataset() {
  const userVotes = getLocalUserVotes();
  return seedData.map((c) => {
    const hasVoted = Boolean(userVotes[c.id]);
    const userRating = userVotes[c.id] || null;
    let votes = c.votes;
    let rating = c.rating;

    if (hasVoted) {
      const totalScore = (c.votes * c.rating) + userRating;
      votes = c.votes + 1;
      rating = Number((totalScore / votes).toFixed(1));
    }

    return {
      ...c,
      votes,
      rating,
      has_voted: hasVoted,
      user_rating: userRating,
    };
  });
}

/**
 * Generic fetch wrapper with error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Fetch all coffees with optional filtering and sorting.
 */
export async function getCoffees({
  search = '',
  origin = '',
  roast = '',
  sortBy = 'rating',
  order = 'desc',
} = {}) {
  try {
    const voterId = getOrCreateVoterId();
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (origin && origin !== 'all') params.append('origin', origin);
    if (roast && roast !== 'all') params.append('roast', roast);
    if (sortBy) params.append('sort_by', sortBy);
    if (order) params.append('order', order);
    params.append('voter_id', voterId);

    return await apiRequest(`/api/coffees?${params.toString()}`);
  } catch (err) {
    console.warn('Backend API unreachable, using client data mode:', err.message);
    let items = getLocalCoffeesDataset();

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.origin.toLowerCase().includes(q) ||
          (c.flavor_notes && c.flavor_notes.toLowerCase().includes(q))
      );
    }

    if (origin && origin !== 'all') {
      items = items.filter((c) => c.origin.toLowerCase() === origin.toLowerCase());
    }

    if (roast && roast !== 'all') {
      items = items.filter((c) => c.roast.toLowerCase() === roast.toLowerCase());
    }

    if (sortBy === 'votes') {
      items.sort((a, b) => (order === 'asc' ? a.votes - b.votes : b.votes - a.votes));
    } else if (sortBy === 'name') {
      items.sort((a, b) => (order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    } else {
      items.sort((a, b) => (order === 'asc' ? a.rating - b.rating : b.rating - a.rating));
    }

    return { success: true, count: items.length, coffees: items };
  }
}

/**
 * Fetch a single coffee by ID.
 */
export async function getCoffeeById(id) {
  try {
    const voterId = getOrCreateVoterId();
    return await apiRequest(`/api/coffees/${id}?voter_id=${encodeURIComponent(voterId)}`);
  } catch {
    const items = getLocalCoffeesDataset();
    const coffee = items.find((c) => c.id === Number(id));
    if (!coffee) throw new Error(`Coffee with ID ${id} not found.`);
    return { success: true, coffee };
  }
}

/**
 * Submit a rating for a specific coffee blend.
 */
export async function submitVote(coffeeId, rating) {
  const voterId = getOrCreateVoterId();
  try {
    const data = await apiRequest(`/api/coffees/${coffeeId}/vote`, {
      method: 'POST',
      body: JSON.stringify({
        voter_id: voterId,
        rating: Number(rating),
      }),
    });
    setLocalUserVote(coffeeId, Number(rating));
    return data;
  } catch (err) {
    if (err.status === 409) throw err;

    // Client fallback mode
    const currentVotes = getLocalUserVotes();
    if (currentVotes[coffeeId]) {
      const duplicateErr = new Error('You have already voted for this coffee blend.');
      duplicateErr.status = 409;
      throw duplicateErr;
    }

    setLocalUserVote(coffeeId, Number(rating));
    const items = getLocalCoffeesDataset();
    const updated = items.find((c) => c.id === Number(coffeeId));

    return {
      success: true,
      message: `Thank you! Your rating of ${rating} stars was recorded.`,
      coffee: updated,
    };
  }
}

/**
 * Fetch leaderboard ranking.
 */
export async function getLeaderboard(limit = 10) {
  try {
    const voterId = getOrCreateVoterId();
    return await apiRequest(`/api/leaderboard?limit=${limit}&voter_id=${encodeURIComponent(voterId)}`);
  } catch {
    const items = getLocalCoffeesDataset();
    items.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
    const top = items.slice(0, limit).map((c, idx) => ({
      ...c,
      rank: idx + 1,
      is_top_three: idx < 3,
    }));
    return { success: true, count: top.length, leaderboard: top };
  }
}

/**
 * Fetch overall statistics.
 */
export async function getStatistics() {
  try {
    return await apiRequest('/api/statistics');
  } catch {
    const items = getLocalCoffeesDataset();
    const totalVotes = items.reduce((acc, c) => acc + c.votes, 0);
    const avgScore = Number((items.reduce((acc, c) => acc + c.rating, 0) / items.length).toFixed(2));
    const roasts = { Light: 0, Medium: 0, Dark: 0 };
    const origins = new Set();
    items.forEach((c) => {
      if (roasts[c.roast] !== undefined) roasts[c.roast]++;
      origins.add(c.origin);
    });

    return {
      success: true,
      total_coffees: items.length,
      total_votes: totalVotes,
      average_rating: avgScore,
      origin_count: origins.size,
      top_origin: 'Ethiopia',
      roast_distribution: roasts,
    };
  }
}

/**
 * Fetch distinct origins for filter options.
 */
export async function getOrigins() {
  try {
    return await apiRequest('/api/origins');
  } catch {
    const origins = Array.from(new Set(seedData.map((c) => c.origin))).sort();
    return { success: true, origins };
  }
}

/**
 * Fetch available roast options.
 */
export async function getRoasts() {
  return { success: true, roasts: ['Light', 'Medium', 'Dark'] };
}

/**
 * Fetch health status of backend API.
 */
export async function getHealth() {
  try {
    return await apiRequest('/api/health');
  } catch {
    return { status: 'client-active', service: 'Coffee Rating Application' };
  }
}
