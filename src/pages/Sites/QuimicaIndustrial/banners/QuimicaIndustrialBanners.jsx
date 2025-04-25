import React, { useState, useEffect } from 'react';
import GridContainer from '../../../../components/GridContainer/GridContainer';
import GridCard from '../../../../components/GridCard/GridCard';
import { useViewMode } from '../../../../contexts/ViewModeContext';
import './QuimicaIndustrialBanners.css';

const QuimicaIndustrialBanners = () => {
    const [banners, setBanners] = useState([]);
    const [filteredBanners, setFilteredBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('name-asc');
    const { viewMode } = useViewMode();

    const sortBanners = (banners, option) => {
        return [...banners].sort((a, b) => {
            switch (option) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
    };

    const handleSearch = (query) => {
        const filtered = banners.filter(banner => 
            banner.name.toLowerCase().includes(query.toLowerCase()) ||
            (banner.description && banner.description.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredBanners(sortBanners(filtered, sortOption));
    };

    const fetchBanners = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/public/banners');
            if (!response.ok) {
                throw new Error('Failed to fetch banners');
            }
            const data = await response.json();
            // Filter banners that are assigned to site1 (QuimicaIndustrial)
            const filteredBanners = data.data
                .filter(banner => banner.site === 'site1')
                .map(banner => ({
                    ...banner,
                    type: 'banner',
                    isDeployed: true // Since we're only showing banners assigned to this site
                }));
            const sortedBanners = sortBanners(filteredBanners, sortOption);
            setBanners(sortedBanners);
            setFilteredBanners(sortedBanners);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [sortOption]);

    const handleBannerUpdate = (updatedBanner) => {
        setBanners(banners.map(banner => 
            banner._id === updatedBanner._id ? updatedBanner : banner
        ));
        setFilteredBanners(filteredBanners.map(banner => 
            banner._id === updatedBanner._id ? updatedBanner : banner
        ));
    };

    const handleBannerDelete = async (banner) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este banner?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/public/banners/${banner._id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete banner');
                }
                setBanners(banners.filter(b => b._id !== banner._id));
                setFilteredBanners(filteredBanners.filter(b => b._id !== banner._id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <GridContainer 
            title="Banners - Química Industrial"
            sortOption={sortOption}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
            listView={viewMode === 'list'}
        >
            {filteredBanners.map((banner) => (
                <GridCard
                    key={banner._id}
                    item={banner}
                    imageUrl={banner.imageUrl}
                    title={banner.name}
                    onUpdate={handleBannerUpdate}
                    onDelete={handleBannerDelete}
                    showDelete={true}
                    showDetails={true}
                    showSite={false}
                />
            ))}
        </GridContainer>
    );
};

export default QuimicaIndustrialBanners; 