// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default API_URL;

// API Endpoints
export const ENDPOINTS = {
    // Admin endpoints (for dashboard)
    BANNERS: `${API_URL}/api/banners`,
    CATEGORIES: `${API_URL}/api/categorias`,
    PRESENTATIONS: `${API_URL}/api/presentaciones`,
    PRODUCTS: `${API_URL}/api/productos`,
    
    // Public endpoints (for frontend sites)
    PUBLIC_BANNERS: `${API_URL}/api/public/banners`,
    PUBLIC_CATEGORIES: `${API_URL}/api/public/categorias`,
    PUBLIC_PRESENTATIONS: `${API_URL}/api/public/presentaciones`,
    PUBLIC_PRODUCTS: `${API_URL}/api/public/productos`,
    
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