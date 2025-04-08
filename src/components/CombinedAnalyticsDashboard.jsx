import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const CombinedAnalyticsDashboard = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/analytics/combined/overview');
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                const data = await response.json();
                setAnalyticsData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    if (loading) {
        return <div className="p-4">Loading analytics data...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!analyticsData) {
        return <div className="p-4">No analytics data available</div>;
    }

    // Get Quimica Industrial data
    const quimicaData = analyticsData.sites.quimicaindustrial;
    if (!quimicaData) {
        return <div className="p-4">No data available for Quimica Industrial</div>;
    }

    // Prepare data for charts
    const dates = quimicaData.rows.map(row => row.dimensionValues[0].value);
    const sessions = quimicaData.rows.map(row => parseInt(row.metricValues[0].value));
    const activeUsers = quimicaData.rows.map(row => parseInt(row.metricValues[1].value));
    const pageViews = quimicaData.rows.map(row => parseInt(row.metricValues[2].value));

    const lineChartData = {
        labels: dates,
        datasets: [
            {
                label: 'Sessions',
                data: sessions,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Active Users',
                data: activeUsers,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            }
        ]
    };

    const barChartData = {
        labels: dates,
        datasets: [
            {
                label: 'Page Views',
                data: pageViews,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Quimica Industrial Analytics Overview'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Quimica Industrial Analytics Dashboard</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Sessions</h3>
                    <p className="text-2xl">{analyticsData.totalSessions}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Active Users</h3>
                    <p className="text-2xl">{analyticsData.totalActiveUsers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Page Views</h3>
                    <p className="text-2xl">{analyticsData.totalPageViews}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Avg. Session Duration</h3>
                    <p className="text-2xl">{Math.round(analyticsData.averageSessionDuration)}s</p>
                </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Sessions & Active Users</h2>
                    <Line data={lineChartData} options={options} />
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Page Views</h2>
                    <Bar data={barChartData} options={options} />
                </div>
            </div>

            {/* Future Sites Section (commented out for now) */}
            {/* <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Future Sites</h2>
                <p className="text-gray-600">
                    Additional sites will be added here as they are created and configured with Google Analytics.
                </p>
            </div> */}
        </div>
    );
};

export default CombinedAnalyticsDashboard; 