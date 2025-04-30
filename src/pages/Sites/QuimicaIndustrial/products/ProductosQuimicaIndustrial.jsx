import React, { useState, useEffect } from 'react';
import GridCard from '../../../../components/GridCard/GridCard';
import GridContainer from '../../../../components/GridContainer/GridContainer';
import { FaTh, FaList, FaSort } from 'react-icons/fa';
import { useViewMode } from '../../../../contexts/ViewModeContext';
import { ENDPOINTS } from '../../../../config/api';
import './ProductosQuimicaIndustrial.css';

const QuimicaIndustrialProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { viewMode } = useViewMode();
    const [sortOption, setSortOption] = useState('name-asc');

    const sortProducts = (products, option) => {
        const sortedProducts = [...products];
        switch (option) {
            case 'name-asc':
                return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            case 'created-asc':
                return sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'created-desc':
                return sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'updated-asc':
                return sortedProducts.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
            case 'updated-desc':
                return sortedProducts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            default:
                return sortedProducts;
        }
    };

    const handleSearch = (query) => {
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.descriptions?.site1 && product.descriptions.site1.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredProducts(sortProducts(filtered, sortOption));
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(ENDPOINTS.PRODUCTS);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                console.log('Raw product data:', data.data[0]); // Log first product to see structure

                // Filter products that have site1 data and map to include only site1 information
                const filteredProducts = data.data
                    .filter(product => product.images?.site1)
                    .map(product => {
                        console.log('Product presentations:', product.presentations);
                        console.log('Product categories:', product.categories);

                        // Get site1 presentations
                        const site1Presentations = product.presentations || [];
                        console.log('Filtered presentations:', site1Presentations);

                        // Get site1 categories
                        const site1Categories = product.categories || [];
                        console.log('Filtered categories:', site1Categories);

                        const mappedProduct = {
                            ...product,
                            type: 'product',
                            images: {
                                site1: product.images.site1
                            },
                            descriptions: {
                                site1: product.descriptions?.site1 || ''
                            },
                            uses: {
                                site1: product.uses?.site1 || ''
                            },
                            presentations: site1Presentations,
                            categories: site1Categories,
                            isDeployed: true,
                            deploymentInfo: 'Desplegado: información desplegada en site 1',
                            site: 'site1'
                        };

                        console.log('Mapped product:', mappedProduct);
                        return mappedProduct;
                    });
                
                const sortedProducts = sortProducts(filteredProducts, sortOption);
                setProducts(sortedProducts);
                setFilteredProducts(sortedProducts);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sortOption]);

    const handleProductUpdate = (updatedProduct) => {
        setProducts(products.map(product => 
            product._id === updatedProduct._id ? updatedProduct : product
        ));
        setFilteredProducts(filteredProducts.map(product => 
            product._id === updatedProduct._id ? updatedProduct : product
        ));
    };

    const handleProductDelete = async (product) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            try {
                const response = await fetch(`${ENDPOINTS.PRODUCTS}/${product._id}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete product');
                }
                
                setProducts(products.filter(p => p._id !== product._id));
                setFilteredProducts(filteredProducts.filter(p => p._id !== product._id));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error al eliminar el producto');
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
            title="Química Industrial - Lista de Productos"
            sortOption={sortOption}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
            listView={viewMode === 'list'}
        >
            {filteredProducts.map((product) => (
                <GridCard
                    key={product._id}
                    item={product}
                    imageUrl={product.images.site1}
                    title={product.name}
                    onUpdate={handleProductUpdate}
                    onDelete={handleProductDelete}
                    showDelete={true}
                />
            ))}
        </GridContainer>
    );
};

export default QuimicaIndustrialProducts; 