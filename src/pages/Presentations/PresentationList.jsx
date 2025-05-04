import React, { useState, useEffect } from 'react';
import GridContainer from '../../components/GridContainer/GridContainer';
import GridCard from '../../components/GridCard/GridCard';
import { FaWater, FaCube } from 'react-icons/fa';
import { useViewMode } from '../../contexts/ViewModeContext';
import { ENDPOINTS } from '../../config/api';
import './PresentationList.css';

const PresentationList = () => {
    const [presentations, setPresentations] = useState([]);
    const [filteredPresentations, setFilteredPresentations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('name-asc');
    const [filterType, setFilterType] = useState('all');
    const { viewMode } = useViewMode();

    const sortPresentations = (presentations, option) => {
        return [...presentations].sort((a, b) => {
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
        const filtered = presentations.filter(presentation => 
            presentation.name.toLowerCase().includes(query.toLowerCase()) ||
            (presentation.description && presentation.description.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredPresentations(sortPresentations(filtered, sortOption));
    };

    const fetchPresentations = async () => {
        try {
            const response = await fetch(ENDPOINTS.PRESENTATIONS);
            if (!response.ok) {
                throw new Error('Failed to fetch presentations');
            }
            const data = await response.json();
            const presentationsWithType = (data.data || []).map(presentation => ({
                ...presentation,
                type: 'presentation'
            }));
            const sortedPresentations = sortPresentations(presentationsWithType, sortOption);
            setPresentations(sortedPresentations);
            setFilteredPresentations(sortedPresentations);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPresentations();
    }, [sortOption]);

    const handlePresentationUpdate = (updatedPresentation) => {
        setPresentations(presentations.map(presentation => 
            presentation._id === updatedPresentation._id ? updatedPresentation : presentation
        ));
        setFilteredPresentations(filteredPresentations.map(presentation => 
            presentation._id === updatedPresentation._id ? updatedPresentation : presentation
        ));
    };

    const handlePresentationDelete = async (presentation) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta presentación?')) {
            try {
                const response = await fetch(`${ENDPOINTS.PRESENTATIONS}/${presentation._id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete presentation');
                }
                setPresentations(presentations.filter(p => p._id !== presentation._id));
                setFilteredPresentations(filteredPresentations.filter(p => p._id !== presentation._id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const filteredByType = filteredPresentations.filter(presentation => {
        if (filterType === 'all') return true;
        return presentation.type === filterType;
    });

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <GridContainer 
            title="Presentaciones"
            sortOption={sortOption}
            onSortChange={(e) => setSortOption(e.target.value)}
            onSearch={handleSearch}
            listView={viewMode === 'list'}
            customControls={
                <div className="type-filters">
                    <button
                        className={`type-filter-button ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                        title="Todos"
                    >
                        Todos
                    </button>
                    <button
                        className={`type-filter-button ${filterType === 'liquido' ? 'active' : ''}`}
                        onClick={() => setFilterType('liquido')}
                        title="Líquidos"
                    >
                        <FaWater />
                    </button>
                    <button
                        className={`type-filter-button ${filterType === 'solido' ? 'active' : ''}`}
                        onClick={() => setFilterType('solido')}
                        title="Sólidos"
                    >
                        <FaCube />
                    </button>
                </div>
            }
        >
            {filteredByType.map((presentation) => (
                <GridCard
                    key={presentation._id}
                    item={presentation}
                    imageUrl={presentation.image || (presentation.images && Object.keys(presentation.images).length > 0 ? 
                        Object.values(presentation.images)[0] : null)}
                    title={presentation.name}
                    onUpdate={handlePresentationUpdate}
                    onDelete={handlePresentationDelete}
                    showDelete={true}
                    showImageNavigation={true}
                    showTypeSeparator={true}
                />
            ))}
        </GridContainer>
    );
};

export default PresentationList; 