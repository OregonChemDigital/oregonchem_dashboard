import React, { useEffect, useState } from 'react';

const AnalyticsWidgets = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const response = await fetch('/analytics/quimicaindustrial/overview');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAnalyticsData(data);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    if (loading) return <p>Loading analytics data...</p>;
    if (!analyticsData) return <p>No analytics data available.</p>;

    return (
        <div className="analytics-widgets">
            <h2>Analytics Overview (Last 30 Days)</h2>
            <ul>
                {analyticsData.rows?.map((row, index) => (
                    <li key={index}>
                        <strong>Date:</strong> {row.dimensionValues[0].value} |{' '}
                        <strong>Sessions:</strong> {row.metricValues[0].value} |{' '}
                        <strong>Active Users:</strong> {row.metricValues[1].value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AnalyticsWidgets;