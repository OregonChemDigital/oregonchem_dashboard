// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const BASE_URL = API_URL;

// API Endpoints
export const ENDPOINTS = {
    // Public endpoints
    BANNERS: `${API_URL}/api/public/banners`,
    CATEGORIES: `${API_URL}/api/public/categorias`,
    PRESENTATIONS: `${API_URL}/api/public/presentaciones`,
    PRODUCTS: `${API_URL}/api/public/productos`,
    
    // Analytics endpoints
    ANALYTICS: {
        OVERVIEW: `${API_URL}/api/analytics/quimicaindustrial/overview`,
        EVENTS: `${API_URL}/api/analytics/quimicaindustrial/events`,
        COMBINED: `${API_URL}/api/analytics/combined/overview`
    },
    
    // Auth endpoints
    AUTH: {
        VERIFY: `${API_URL}/auth/verify`
    }
}; 