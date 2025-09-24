import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './GridCard.css';

const GridCard = ({ 
  item, 
  onUpdate, 
  onDelete, 
  showDelete = false,
  onClick,
  imageUrl,
  title,
  subtitle,
  details = [],
  showImageNavigation = false,
  showDetails = false,
  showSite = false,
  showTypeSeparator = false
}) => {
  const handleUpdate = (e) => {
    e.stopPropagation();
    if (onUpdate) onUpdate(item);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(item);
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on action buttons
    if (e.target.closest('.grid-card-actions')) {
      return;
    }
    if (onClick) onClick(item);
  };

  const getTypeClass = () => {
    if (!showTypeSeparator || !item.type) return '';
    return item.type.toLowerCase() === 'solido' ? 'type-solid' : 'type-liquid';
  };

  return (
    <div 
      className={`grid-card ${getTypeClass()}`} 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="grid-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="no-image">No hay imagen disponible</div>
        )}
      </div>
      <div className="grid-card-content">
        <h3 className="grid-card-title">{title}</h3>
        {showDetails && (
          <div className="grid-card-details">
            <p className="detail-item">Fecha: {new Date(item.createdAt).toLocaleDateString()}</p>
            {showSite && <p className="detail-item">Sitio: {item.site || 'Global'}</p>}
          </div>
        )}
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {details.length > 0 && (
          <div className="details">
            {details.map((detail, index) => (
              <p key={index}>{detail}</p>
            ))}
          </div>
        )}
      </div>
      <div className="grid-card-actions">
        <button className="edit-button" onClick={handleUpdate} title="Actualizar">
          <FaEdit />
        </button>
        {showDelete && (
          <button className="delete-button" onClick={handleDelete} title="Eliminar">
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
};

export default GridCard; 