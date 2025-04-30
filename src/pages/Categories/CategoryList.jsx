import React, { useState, useEffect } from 'react';
import GridContainer from '../../components/GridContainer/GridContainer';
import GridCard from '../../components/GridCard/GridCard';
import { useViewMode } from '../../contexts/ViewModeContext';
import { ENDPOINTS } from '../../config/api';
import './CategoryList.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('name-asc');
    const { viewMode } = useViewMode();

    const sortCategories = (categories, option) => {
        return [...categories].sort((a, b) => {
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
        const filtered = categories.filter(category => 
            category.name.toLowerCase().includes(query.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredCategories(sortCategories(filtered, sortOption));
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(ENDPOINTS.CATEGORIES);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            const categoriesWithType = (data.data || []).map(category => ({
                ...category,
                type: 'category'
            }));
            const sortedCategories = sortCategories(categoriesWithType, sortOption);
            setCategories(sortedCategories);
            setFilteredCategories(sortedCategories);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [sortOption]);

    const handleCategoryUpdate = (updatedCategory) => {
        setCategories(categories.map(category => 
            category._id === updatedCategory._id ? updatedCategory : category
        ));
        setFilteredCategories(filteredCategories.map(category => 
            category._id === updatedCategory._id ? updatedCategory : category
        ));
    };

    const handleCategoryDelete = async (category) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            try {
                const response = await fetch(`${ENDPOINTS.CATEGORIES}/${category._id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete category');
                }
                setCategories(categories.filter(c => c._id !== category._id));
                setFilteredCategories(filteredCategories.filter(c => c._id !== category._id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleCategoryClick = (category) => {
        // This will be handled by GridContainer
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <GridContainer 
            title="Todas las Categorías"
            sortOption={sortOption}
            onSortChange={(e) => setSortOption(e.target.value)}
            onSearch={handleSearch}
            listView={viewMode === 'list'}
        >
            {filteredCategories.map((category) => (
                <GridCard
                    key={category._id}
                    item={category}
                    imageUrl={category.image || (category.images && Object.keys(category.images).length > 0 ? 
                        Object.values(category.images)[0] : null)}
                    title={category.name}
                    onUpdate={handleCategoryUpdate}
                    onDelete={handleCategoryDelete}
                    onClick={handleCategoryClick}
                    showDelete={true}
                    showImageNavigation={true}
                />
            ))}
        </GridContainer>
    );
};

export default CategoryList; 