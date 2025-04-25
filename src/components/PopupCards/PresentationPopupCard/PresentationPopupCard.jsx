import React, { useState, useEffect } from 'react';
import './PresentationPopupCard.css';
import { FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';

const PresentationPopupCard = ({ 
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-card presentation-popup" onClick={(e) => e.stopPropagation()}>
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

                        <div className="info-section">
                            <h4>Detalles de la Presentación</h4>
                            <div className="presentation-details">
                                <div className="presentation-detail">
                                    <span className="detail-label">Tipo:</span>
                                    <span className="detail-value">{item.presentationType === 'solido' ? 'Sólido' : 'Líquido'}</span>
                                </div>
                                <div className="presentation-detail">
                                    <span className="detail-label">Medida:</span>
                                    <span className="detail-value">{item.measure || 'No especificado'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-section">
                            <h4>Fechas</h4>
                            <div className="dates-info">
                                <div className="date-item">
                                    <span className="date-label">Fecha de Creación:</span>
                                    <span className="date-value">{formatDate(item.createdAt)}</span>
                                </div>
                                <div className="date-item">
                                    <span className="date-label">Última Actualización:</span>
                                    <span className="date-value">{formatDate(item.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="popup-actions">
                            <button className="edit-button" onClick={handleUpdate}>
                                <FaEdit />
                                Editar
                            </button>
                            <button className="delete-button" onClick={handleDelete}>
                                <FaTrash />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PresentationPopupCard; 