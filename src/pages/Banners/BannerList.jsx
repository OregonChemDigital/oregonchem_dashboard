import React, { useState, useEffect } from 'react';
import GridContainer from '../../components/GridContainer/GridContainer';
import GridCard from '../../components/GridCard/GridCard';
import { useViewMode } from '../../contexts/ViewModeContext';
import { ENDPOINTS } from '../../config/api';
import './BannerList.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BannerList = () => {
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
            const response = await fetch(ENDPOINTS.BANNERS);
            if (!response.ok) {
                throw new Error('Failed to fetch banners');
            }
            const data = await response.json();
            const bannersWithType = (data.data || []).map(banner => ({
                ...banner,
                type: 'banner'
            }));
            const sortedBanners = sortBanners(bannersWithType, sortOption);
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

    const renderListHeader = () => {
        return (
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Sitio</th>
                    <th>Fecha de Creación</th>
                    <th>Última Actualización</th>
                    <th>Acciones</th>
                </tr>
            </thead>
        );
    };

    const renderListRow = (banner, handleClick) => {
        return (
            <tr 
                key={banner._id} 
                onClick={() => handleClick(banner)}
                style={{ cursor: 'pointer' }}
            >
                <td>{banner.name}</td>
                <td>{banner.site || 'Global'}</td>
                <td>{new Date(banner.createdAt).toLocaleDateString()}</td>
                <td>{new Date(banner.updatedAt).toLocaleDateString()}</td>
                <td>
                    <div className="list-actions">
                        <button 
                            className="edit-button" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBannerUpdate(banner);
                            }}
                            title="Actualizar"
                        >
                            <FaEdit />
                        </button>
                        <button 
                            className="delete-button" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBannerDelete(banner);
                            }}
                            title="Eliminar"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <GridContainer 
            title="Banners"
            sortOption={sortOption}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
            listView={viewMode === 'list'}
            renderListHeader={renderListHeader}
            renderListRow={renderListRow}
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
                    showSite={true}
                />
            ))}
        </GridContainer>
    );
};

export default BannerList; 