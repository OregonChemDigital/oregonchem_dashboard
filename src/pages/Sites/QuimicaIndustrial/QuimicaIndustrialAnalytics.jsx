import React, { useState, useEffect } from 'react';
import './QuimicaIndustrialAnalytics.css';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../../firebase/firebase';
import { useAuth } from '../../../contexts/authContext';
import AnalyticsWidget from '../../../components/widgets/AnalyticsWidget';

const QuimicaIndustrial = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customEvents, setCustomEvents] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                if (!currentUser) {
                    throw new Error('User not authenticated');
                }

                // Get the ID token
                const token = await currentUser.getIdToken();

                // Fetch general analytics data
                const response = await fetch('https://oregonchem-backend.onrender.com/api/analytics/quimicaindustrial/overview', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Fetch custom events data
                const eventsResponse = await fetch('https://oregonchem-backend.onrender.com/api/analytics/quimicaindustrial/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!eventsResponse.ok) {
                    throw new Error(`HTTP error! status: ${eventsResponse.status}`);
                }
                const eventsData = await eventsResponse.json();

                setAnalyticsData(data);
                setCustomEvents(eventsData);
            } catch (err) {
                console.error('Error fetching analytics data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchAnalyticsData();
        }
    }, [currentUser]);

    const renderAnalyticsCard = (title, value, unit = '') => {
        if (!value) return null;
        return (
            <div className="analytics-card">
                <h3>{title}</h3>
                <p>{value}{unit}</p>
            </div>
        );
    };

    const renderEventCard = (title, count) => {
        return (
            <div className="analytics-card">
                <h3>{title}</h3>
                <p>{count || 0}</p>
            </div>
        );
    };

    if (loading) return <div className="loading">Loading analytics data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="quimica-industrial-container">
            <h1>Química Industrial Analytics</h1>
            
            {/* General Analytics Section */}
            <div className="analytics-section">
                <h2>General Analytics</h2>
                <div className="analytics-grid">
                    {renderAnalyticsCard(
                        'Total Sessions (All Time)',
                        analyticsData?.totalSessions
                    )}
                    {renderAnalyticsCard(
                        'Total Sessions (Today)',
                        analyticsData?.todaySessions
                    )}
                    {renderAnalyticsCard(
                        'Active Users',
                        analyticsData?.activeUsers
                    )}
                    {renderAnalyticsCard(
                        'Page Views (All Time)',
                        analyticsData?.totalPageViews
                    )}
                    {renderAnalyticsCard(
                        'Page Views (Today)',
                        analyticsData?.todayPageViews
                    )}
                </div>
            </div>

            {/* Cotizar Button Analytics */}
            <div className="analytics-section">
                <h2>Cotizar Button Analytics</h2>
                <div className="analytics-grid">
                    {renderEventCard(
                        'Hero Section Cotizar Clicks',
                        customEvents?.hero_cotizar_click
                    )}
                    {renderEventCard(
                        'Featured Section Cotizar Clicks',
                        customEvents?.featured_cotizar_click
                    )}
                    {renderEventCard(
                        'Wishlist Popup Cotizar Clicks',
                        customEvents?.wishlist_cotizar_click
                    )}
                    {renderEventCard(
                        'NavBar Cotizar Clicks',
                        customEvents?.navbar_cotizar_click
                    )}
                </div>
            </div>

            {/* Navigation Analytics */}
            <div className="analytics-section">
                <h2>Navigation Analytics</h2>
                <div className="analytics-grid">
                    {renderEventCard(
                        'Wishlist Popup Usage',
                        customEvents?.wishlist_popup_open
                    )}
                    {renderEventCard(
                        'NavBar Productos Clicks',
                        customEvents?.navbar_productos_click
                    )}
                </div>
            </div>

            {/* Conversion Analytics */}
            <div className="analytics-section">
                <h2>Conversion Analytics</h2>
                <div className="analytics-grid">
                    {renderAnalyticsCard(
                        'Homepage to Quote Form Conversion Rate',
                        analyticsData?.conversionRate ? `${analyticsData.conversionRate}%` : null
                    )}
                </div>
            </div>

            {/* Product Analytics */}
            <div className="analytics-section">
                <h2>Product Analytics</h2>
                <div className="analytics-grid">
                    {renderAnalyticsCard(
                        'Most Viewed Product',
                        analyticsData?.mostViewedProduct
                    )}
                    {renderAnalyticsCard(
                        'Most Quoted Product',
                        analyticsData?.mostQuotedProduct
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuimicaIndustrial;