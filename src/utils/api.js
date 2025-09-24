const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MIN_FETCH_INTERVAL = 30 * 1000; // 30 seconds minimum between fetches

// API URL configuration
export const API_URL = import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL || 'http://localhost:5001')
    : 'https://oregonchem-backend.onrender.com';

// Environment configuration

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
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
    // Products (Admin endpoints for dashboard)
    PRODUCTS: '/api/productos',
    PUBLIC_PRODUCTS: '/api/public/productos',
    CREATE_PRODUCT: '/api/productos/nuevo',
    NEW_AI_PRODUCT: '/api/productos/ai/nuevo',
    UPDATE_PRODUCT: '/api/productos',
    DELETE_PRODUCT: '/api/productos',
    
    // Categories (Admin endpoints for dashboard)
    CATEGORIES: '/api/categorias',
    PUBLIC_CATEGORIES: '/api/public/categorias',
    CREATE_CATEGORY: '/api/categorias/nueva',
    UPDATE_CATEGORY: '/api/categorias',
    DELETE_CATEGORY: '/api/categorias',
    
    // Presentations (Admin endpoints for dashboard)
    PRESENTATIONS: '/api/presentaciones',
    PUBLIC_PRESENTATIONS: '/api/public/presentaciones',
    CREATE_PRESENTATION: '/api/presentaciones/nueva',
    UPDATE_PRESENTATION: '/api/presentaciones',
    DELETE_PRESENTATION: '/api/presentaciones',
    
    // Banners (Admin endpoints for dashboard)
    BANNERS: '/api/banners',
    PUBLIC_BANNERS: '/api/public/banners',
    CREATE_BANNER: '/api/banners/nuevo',
    
    // Quotes
    QUOTES: '/api/public/quotes',
    
    // Analytics
    ANALYTICS: '/api/analytics',
    
    // Search
    SEARCH: '/api/search',
    
    // Auth
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY_TOKEN: '/api/auth/verify-token'
}; 