import React, { useState, useEffect } from 'react';
import GridContainer from '../../components/GridContainer/GridContainer';
import GridCard from '../../components/GridCard/GridCard';
import './AllProductsList.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ENDPOINTS } from '../../config/api';

const AllProductsList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredProducts(sortProducts(filtered, sortOption));
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(ENDPOINTS.PRODUCTS);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            // Add type property to each product
            const productsWithType = (data.data || []).map(product => ({
                ...product,
                type: 'product'
            }));
            const sortedProducts = sortProducts(productsWithType, sortOption);
            setProducts(sortedProducts);
            setFilteredProducts(sortedProducts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [sortOption]);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleProductUpdate = (updatedProduct) => {
        console.log('Product Update:', updatedProduct);
        setProducts(products.map(product => 
            product._id === updatedProduct._id ? updatedProduct : product
        ));
        setFilteredProducts(filteredProducts.map(product => 
            product._id === updatedProduct._id ? updatedProduct : product
        ));
    };

    const handleProductDelete = async (product) => {
        console.log('Product Delete:', product);
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

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <GridContainer 
            title="Productos - Lista Principal"
            sortOption={sortOption}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
            renderListRow={(item, handleClick) => (
                <tr 
                    key={item._id} 
                    onClick={() => handleClick(item)}
                    style={{ cursor: 'pointer' }}
                >
                    <td>{item.name}</td>
                    <td>{item.site || 'Global'}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td>
                        <div className="list-actions">
                            <button 
                                className="edit-button" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductUpdate(item);
                                }}
                                title="Actualizar"
                            >
                                <FaEdit />
                            </button>
                            <button 
                                className="delete-button" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductDelete(item);
                                }}
                                title="Eliminar"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </td>
                </tr>
            )}
            renderPopupContent={(item, onClose) => {
                console.log('Popup Item Data:', item);
                console.log('Popup Item Presentations:', item.presentations);
                console.log('Popup Item Categories:', item.categories);
                console.log('Popup Item Descriptions:', item.descriptions);
                console.log('Popup Item Uses:', item.uses);
                
                // Debug the actual rendering
                const presentations = item.presentations || [];
                const categories = item.categories || [];
                const descriptions = item.descriptions || {};
                const uses = item.uses || {};

                console.log('Processed Presentations:', presentations);
                console.log('Processed Categories:', categories);
                console.log('Processed Descriptions:', descriptions);
                console.log('Processed Uses:', uses);

                return (
                    <div className="product-popup-content">
                        <div className="popup-image-container">
                            {item.images && Object.keys(item.images).length > 0 ? (
                                <>
                                    <img 
                                        src={Object.values(item.images)[0]} 
                                        alt={item.name} 
                                        className="popup-image"
                                    />
                                    {Object.keys(item.images).length > 1 && (
                                        <div className="thumbnail-container">
                                            {Object.entries(item.images).map(([site, image], index) => (
                                                <div key={index} className="thumbnail-wrapper">
                                                    <img
                                                        src={image}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="thumbnail"
                                                    />
                                                    <div className="thumbnail-site">Sitio {site}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>
                        <div className="popup-details">
                            <h3 className="product-name">{item.name}</h3>
                            <div className="site-info">
                                <span className="site-label">Desplegado:</span>
                                <span className="site-value">{item.site || 'Global'}</span>
                            </div>

                            {presentations.length > 0 && (
                                <div className="info-section">
                                    <h4>Presentaciones Disponibles</h4>
                                    <div className="presentations-list">
                                        {presentations.map((presentation, index) => {
                                            console.log('Rendering Presentation:', presentation);
                                            return (
                                                <div key={index} className="presentation-item">
                                                    {presentation.name}{presentation.measure ? ` - ${presentation.measure}` : ''}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {categories.length > 0 && (
                                <div className="info-section">
                                    <h4>Categorías</h4>
                                    <div className="categories-list">
                                        {categories.map((category, index) => {
                                            console.log('Rendering Category:', category);
                                            return (
                                                <div key={index} className="category-item">
                                                    {category.name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {Object.keys(descriptions).length > 0 && (
                                <div className="info-section">
                                    <h4>Descripciones</h4>
                                    <div className="descriptions-columns">
                                        {Object.entries(descriptions).map(([site, description], index) => {
                                            console.log('Rendering Description:', { site, description });
                                            return (
                                                <div key={index} className="description-column">
                                                    <div className="site-label">Sitio {site}</div>
                                                    <div className="description-content">{description}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {Object.keys(uses).length > 0 && (
                                <div className="info-section">
                                    <h4>Usos</h4>
                                    <div className="uses-columns">
                                        {Object.entries(uses).map(([site, use], index) => {
                                            console.log('Rendering Use:', { site, use });
                                            return (
                                                <div key={index} className="use-column">
                                                    <div className="site-label">Sitio {site}</div>
                                                    <div className="use-content">{use}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="popup-actions">
                                <button 
                                    className="edit-button" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductUpdate(item);
                                    }}
                                    title="Actualizar"
                                >
                                    <FaEdit />
                                </button>
                                <button 
                                    className="delete-button" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductDelete(item);
                                    }}
                                    title="Eliminar"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }}
        >
            {filteredProducts.map((product) => (
                <GridCard
                    key={product._id}
                    item={product}
                    imageUrl={product.images && Object.keys(product.images).length > 0 ? 
                        Object.values(product.images)[0] : null}
                    title={product.name}
                    onUpdate={handleProductUpdate}
                    onDelete={handleProductDelete}
                    showDelete={true}
                    showImageNavigation={true}
                    isProduct={true}
                    renderPopupContent={(item, onClose) => {
                        console.log('GridCard Popup Item Data:', item);
                        console.log('GridCard Popup Item Presentations:', item.presentations);
                        console.log('GridCard Popup Item Categories:', item.categories);
                        console.log('GridCard Popup Item Descriptions:', item.descriptions);
                        console.log('GridCard Popup Item Uses:', item.uses);
                        
                        const presentations = item.presentations || [];
                        const categories = item.categories || [];
                        const descriptions = item.descriptions || {};
                        const uses = item.uses || {};
                        const images = item.images || {};

                        return (
                            <div className="product-popup-content">
                                <div className="popup-image-container">
                                    {Object.keys(images).length > 0 ? (
                                        <>
                                            <img 
                                                src={Object.values(images)[0]} 
                                                alt={item.name} 
                                                className="popup-image"
                                                onClick={() => {
                                                    const imageValues = Object.values(images);
                                                    const currentIndex = imageValues.indexOf(Object.values(images)[0]);
                                                    const nextIndex = (currentIndex + 1) % imageValues.length;
                                                    const nextImage = imageValues[nextIndex];
                                                    const img = document.querySelector('.popup-image');
                                                    if (img) {
                                                        img.src = nextImage;
                                                    }
                                                }}
                                            />
                                            <div className="thumbnail-container">
                                                {Object.entries(images).map(([site, image], index) => (
                                                    <div 
                                                        key={index} 
                                                        className="thumbnail-wrapper"
                                                        onClick={() => {
                                                            const img = document.querySelector('.popup-image');
                                                            if (img) {
                                                                img.src = image;
                                                            }
                                                        }}
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            className="thumbnail"
                                                        />
                                                        <div className="thumbnail-site">Sitio {site}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                                <div className="popup-details">
                                    <h3 className="product-name">{item.name}</h3>
                                    <div className="site-info">
                                        <span className="site-label">Desplegado:</span>
                                        <span className="site-value">{item.site || 'Global'}</span>
                                    </div>

                                    {presentations.length > 0 && (
                                        <div className="info-section">
                                            <h4>Presentaciones Disponibles</h4>
                                            <div className="presentations-list">
                                                {presentations.map((presentation, index) => (
                                                    <div key={index} className="presentation-item">
                                                        {presentation.name}{presentation.measure ? ` - ${presentation.measure}` : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {categories.length > 0 && (
                                        <div className="info-section">
                                            <h4>Categorías</h4>
                                            <div className="categories-list">
                                                {categories.map((category, index) => (
                                                    <div key={index} className="category-item">
                                                        {category.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {Object.keys(descriptions).length > 0 && (
                                        <div className="info-section">
                                            <h4>Descripciones</h4>
                                            <div className="descriptions-columns">
                                                {Object.entries(descriptions).map(([site, description], index) => (
                                                    <div key={index} className="description-column">
                                                        <div className="site-label">Sitio {site}</div>
                                                        <div className="description-content">{description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {Object.keys(uses).length > 0 && (
                                        <div className="info-section">
                                            <h4>Usos</h4>
                                            <div className="uses-columns">
                                                {Object.entries(uses).map(([site, use], index) => (
                                                    <div key={index} className="use-column">
                                                        <div className="site-label">Sitio {site}</div>
                                                        <div className="use-content">{use}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="popup-actions">
                                        <button 
                                            className="edit-button" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductUpdate(item);
                                            }}
                                            title="Actualizar"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className="delete-button" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductDelete(item);
                                            }}
                                            title="Eliminar"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                />
            ))}
        </GridContainer>
    );
};

export default AllProductsList; 