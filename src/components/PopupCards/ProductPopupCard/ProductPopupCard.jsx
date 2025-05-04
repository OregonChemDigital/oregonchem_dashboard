import React, { useState, useEffect } from 'react';
import './ProductPopupCard.css';
import { FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';

const ProductPopupCard = ({ 
    isOpen, 
    onClose, 
    item, 
    title, 
    onUpdate, 
    onDelete 
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const images = item.images ? Object.values(item.images) : [];
    const hasMultipleImages = images.length > 1;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowLeft') {
            handlePrevImage();
        } else if (e.key === 'ArrowRight') {
            handleNextImage();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleUpdate = (e) => {
        e.stopPropagation();
        if (onUpdate) onUpdate(item);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(item);
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-card product-popup" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="popup-content">
                    <div className="popup-image-section">
                        <div className="popup-image-container">
                            {images.length > 0 ? (
                                <>
                                    <img 
                                        src={images[currentImageIndex]} 
                                        alt={`${item.name} - Image ${currentImageIndex + 1}`} 
                                        className="popup-image"
                                        onLoad={() => setIsLoading(false)}
                                        onError={() => setIsLoading(false)}
                                    />
                                    {hasMultipleImages && (
                                        <>
                                            <button 
                                                className="image-nav-button prev" 
                                                onClick={handlePrevImage}
                                                aria-label="Previous image"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            <button 
                                                className="image-nav-button next" 
                                                onClick={handleNextImage}
                                                aria-label="Next image"
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : null}
                        </div>
                        {hasMultipleImages && (
                            <div className="thumbnail-container">
                                {Object.entries(item.images).map(([site, url], index) => (
                                    <div key={index} className="thumbnail-wrapper">
                                        <img
                                            src={url}
                                            alt={`Thumbnail ${index + 1}`}
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => handleThumbnailClick(index)}
                                        />
                                        <div className="thumbnail-site">{site}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="popup-details">
                        <h3 className="item-name">{item.name}</h3>
                        
                        <div className="info-section">
                            <h4>Estado de Despliegue</h4>
                            <div className="deployment-status">
                                {item.site ? `Desplegado en: ${item.site}` : 'Desplegado Globalmente'}
                            </div>
                        </div>

                        {item.presentations && item.presentations.length > 0 && (
                            <div className="info-section">
                                <h4>Presentaciones</h4>
                                <div className="presentations-list">
                                    {item.presentations.map((presentation, index) => (
                                        <div key={index} className="presentation-item">
                                            {presentation.name}{presentation.measure ? ` - ${presentation.measure}` : ''}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.categories && item.categories.length > 0 && (
                            <div className="info-section">
                                <h4>Categorías</h4>
                                <div className="categories-list">
                                    {item.categories.map((category, index) => (
                                        <div key={index} className="category-item">
                                            {category.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.descriptions && (
                            <div className="info-section">
                                <h4>Descripciones</h4>
                                <div className="descriptions-list">
                                    {item.descriptions.site1 && (
                                        <div className="description-item">
                                            <span className="site-label">Sitio 1:</span>
                                            {item.descriptions.site1}
                                        </div>
                                    )}
                                    {item.descriptions.site2 && (
                                        <div className="description-item">
                                            <span className="site-label">Sitio 2:</span>
                                            {item.descriptions.site2}
                                        </div>
                                    )}
                                    {item.descriptions.site3 && (
                                        <div className="description-item">
                                            <span className="site-label">Sitio 3:</span>
                                            {item.descriptions.site3}
                                        </div>
                                    )}
                                    {item.descriptions.site4 && (
                                        <div className="description-item">
                                            <span className="site-label">Sitio 4:</span>
                                            {item.descriptions.site4}
                                        </div>
                                    )}
                                    {item.descriptions.site5 && (
                                        <div className="description-item">
                                            <span className="site-label">Sitio 5:</span>
                                            {item.descriptions.site5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {item.uses && (
                            <div className="info-section">
                                <h4>Usos</h4>
                                <div className="uses-list">
                                    {item.uses.site1 && (
                                        <div className="use-item">
                                            <span className="site-label">Sitio 1:</span>
                                            {item.uses.site1}
                                        </div>
                                    )}
                                    {item.uses.site2 && (
                                        <div className="use-item">
                                            <span className="site-label">Sitio 2:</span>
                                            {item.uses.site2}
                                        </div>
                                    )}
                                    {item.uses.site3 && (
                                        <div className="use-item">
                                            <span className="site-label">Sitio 3:</span>
                                            {item.uses.site3}
                                        </div>
                                    )}
                                    {item.uses.site4 && (
                                        <div className="use-item">
                                            <span className="site-label">Sitio 4:</span>
                                            {item.uses.site4}
                                        </div>
                                    )}
                                    {item.uses.site5 && (
                                        <div className="use-item">
                                            <span className="site-label">Sitio 5:</span>
                                            {item.uses.site5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="popup-actions">
                            <button 
                                className="edit-button" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate(item);
                                }}
                                title="Actualizar"
                            >
                                <FaEdit />
                            </button>
                            <button 
                                className="delete-button" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item);
                                }}
                                title="Eliminar"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPopupCard; 