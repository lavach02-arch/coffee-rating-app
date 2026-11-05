/**
 * BaristaPulse Coffee Rating API Client
 * Manages communication with the Flask REST API and persists voter ID in localStorage.
 */

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
  const voterId = getOrCreateVoterId();
  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (origin && origin !== 'all') params.append('origin', origin);
  if (roast && roast !== 'all') params.append('roast', roast);
  if (sortBy) params.append('sort_by', sortBy);
  if (order) params.append('order', order);
  params.append('voter_id', voterId);

  return apiRequest(`/api/coffees?${params.toString()}`);
}

/**
 * Fetch a single coffee by ID.
 */
export async function getCoffeeById(id) {
  const voterId = getOrCreateVoterId();
  return apiRequest(`/api/coffees/${id}?voter_id=${encodeURIComponent(voterId)}`);
}

/**
 * Submit a rating for a specific coffee blend.
 */
export async function submitVote(coffeeId, rating) {
  const voterId = getOrCreateVoterId();
  const data = await apiRequest(`/api/coffees/${coffeeId}/vote`, {
    method: 'POST',
    body: JSON.stringify({
      voter_id: voterId,
      rating: Number(rating),
    }),
  });

  // Update local cache for immediate UI responsiveness
  setLocalUserVote(coffeeId, Number(rating));
  return data;
}

/**
 * Fetch leaderboard ranking.
 */
export async function getLeaderboard(limit = 10) {
  const voterId = getOrCreateVoterId();
  return apiRequest(`/api/leaderboard?limit=${limit}&voter_id=${encodeURIComponent(voterId)}`);
}

/**
 * Fetch overall statistics.
 */
export async function getStatistics() {
  return apiRequest('/api/statistics');
}

/**
 * Fetch distinct origins for filter options.
 */
export async function getOrigins() {
  return apiRequest('/api/origins');
}

/**
 * Fetch available roast options.
 */
export async function getRoasts() {
  return apiRequest('/api/roasts');
}

/**
 * Fetch health status of backend API.
 */
export async function getHealth() {
  return apiRequest('/api/health');
}
