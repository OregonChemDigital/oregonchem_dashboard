import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
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
    Title,
    Tooltip,
    Legend
);

const AnalyticsDashboard = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/analytics/quimicaindustrial/overview');
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

    // Prepare data for charts
    const dates = analyticsData.rows.map(row => {
        const dateStr = row.dimensionValues[0].value;
        return `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}/${dateStr.slice(0, 4)}`;
    }).reverse();

    const sessions = analyticsData.rows.map(row => parseInt(row.metricValues[0].value)).reverse();
    const activeUsers = analyticsData.rows.map(row => parseInt(row.metricValues[1].value)).reverse();
    const pageViews = analyticsData.rows.map(row => parseInt(row.metricValues[2].value)).reverse();

    const lineChartData = {
        labels: dates,
        datasets: [
            {
                label: 'Sessions',
                data: sessions,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Active Users',
                data: activeUsers,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    const barChartData = {
        labels: dates,
        datasets: [
            {
                label: 'Page Views',
                data: pageViews,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
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
                text: 'Analytics Overview'
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
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
            
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
        </div>
    );
};

export default AnalyticsDashboard; 