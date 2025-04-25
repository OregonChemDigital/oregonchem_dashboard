import React, { useState, useEffect } from "react";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import "./BannerPopupCard.css";

const BannerPopupCard = ({ isOpen, onClose, item, title, onUpdate, onDelete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="popup-content">
          <div className="popup-image-section">
            <div className="popup-image-container">
              {isLoading && <div className="image-loading">Cargando imagen...</div>}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={title}
                  onLoad={handleImageLoad}
                  style={{ display: isLoading ? "none" : "block" }}
                />
              ) : (
                <div className="no-image">No hay imagen disponible</div>
              )}
            </div>
          </div>
          <div className="popup-details">
            <div className="info-section">
              <h3>Información del Sitio</h3>
              <p className="site-info">
                {item.site ? `Desplegado en: ${item.site}` : 'No asignado a ningún sitio'}
              </p>
            </div>
            <div className="info-section">
              <h3>Fechas</h3>
              <p>Creación: {new Date(item.createdAt).toLocaleDateString()}</p>
              <p>Última Actualización: {new Date(item.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="popup-actions">
          <button className="edit-button" onClick={() => onUpdate(item)}>
            <FaEdit /> Editar
          </button>
          <button className="delete-button" onClick={() => onDelete(item)}>
            <FaTrash /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerPopupCard; 