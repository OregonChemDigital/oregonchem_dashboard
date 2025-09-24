import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './BaseCard.css';

const BaseCard = ({ 
    item,
    imageUrl,
    title,
    subtitle,
    details = [],
    onUpdate,
    onDelete,
    showDelete = false,
    customContent,
    onClick
}) => {
    const handleUpdate = (e) => {
        e.stopPropagation();
        if (onUpdate) onUpdate(item);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(item);
    };

    return (
        <div className="base-card" onClick={onClick}>
            <div className="base-card-image">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} />
                ) : (
                    <div className="no-image">No hay imagen disponible</div>
                )}
            </div>
            <div className="base-card-content">
                <h3>{title}</h3>
                {subtitle && <p className="subtitle">{subtitle}</p>}
                {customContent || (
                    <div className="details">
                        {details.map((detail, index) => (
                            <p key={index}>{detail}</p>
                        ))}
                    </div>
                )}
            </div>
            <div className="base-card-actions">
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

export default BaseCard; 