const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MIN_FETCH_INTERVAL = 30 * 1000; // 30 seconds minimum between fetches

// API URL configuration
export const API_URL = import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL || 'http://localhost:5001')
    : 'https://oregonchem-backend.onrender.com';

console.log('API URL:', API_URL); // Debug log

class APICache {
    constructor() {
        this.cache = new Map();
        this.lastFetchTimes = new Map();
    }

    getCacheKey(endpoint) {
        return endpoint;
    }

    get(endpoint) {
        const cacheKey = this.getCacheKey(endpoint);
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return cached.data;
        }

        return null;
    }

    set(endpoint, data) {
        const cacheKey = this.getCacheKey(endpoint);
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    canFetch(endpoint, force = false) {
        if (force) return true;

        const lastFetch = this.lastFetchTimes.get(endpoint) || 0;
        return (Date.now() - lastFetch) >= MIN_FETCH_INTERVAL;
    }

    updateLastFetch(endpoint) {
        this.lastFetchTimes.set(endpoint, Date.now());
    }

    clear() {
        this.cache.clear();
        this.lastFetchTimes.clear();
    }
}

const apiCache = new APICache();

export const fetchWithCache = async (endpoint, options = {}, force = false) => {
    const url = `${API_URL}${endpoint}`;
    console.log('Fetching from:', url); // Debug log

    // Check cache first
    if (!force) {
        const cachedData = apiCache.get(url);
        if (cachedData) {
            console.log('Using cached data for:', url); // Debug log
            return cachedData;
        }
    }

    // Check rate limiting
    if (!apiCache.canFetch(url, force)) {
        return apiCache.get(url) || null;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            mode: 'cors'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText); // Debug log
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        // Update cache
        apiCache.set(url, data);
        apiCache.updateLastFetch(url);

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const clearCache = () => {
    apiCache.clear();
};

// Common API endpoints
export const API_ENDPOINTS = {
    PRODUCTS: '/api/public/productos',
    NEW_PRODUCT: '/api/productos/nuevo',
    CATEGORIES: '/api/public/categorias',
    NEW_CATEGORY: '/api/categorias/nueva',
    PRESENTATIONS: '/api/public/presentaciones',
    NEW_PRESENTATION: '/api/presentaciones/nueva',
    BANNERS: '/api/public/banners',
    NEW_BANNER: '/api/banners/nuevo',
    QUOTES: '/api/public/quotes',
    ANALYTICS: '/api/analytics'
}; 