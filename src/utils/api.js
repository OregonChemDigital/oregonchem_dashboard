const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MIN_FETCH_INTERVAL = 30 * 1000; // 30 seconds minimum between fetches

// API URL configuration
export const API_URL = import.meta.env.PROD
    ? 'https://oregonchem-backend.onrender.com'
    : (import.meta.env.VITE_API_URL || 'https://oregonchem-backend.onrender.com');

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

    // Check cache first
    if (!force) {
        const cachedData = apiCache.get(url);
        if (cachedData) {
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

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
    NEW_PRESENTATION: '/api/presentaciones/nuevo',
    BANNERS: '/api/public/banners',
    NEW_BANNER: '/api/banners/nuevo',
    QUOTES: '/api/public/quotes',
    ANALYTICS: '/api/analytics'
}; 