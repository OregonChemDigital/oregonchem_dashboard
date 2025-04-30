import React, { useState } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { API_ENDPOINTS } from '../../utils/api';
import "./Forms.css";

const CategoryForm = ({ onCategoryAdded, onClose }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [categoryName, setCategoryName] = useState("");
  const [categoryImages, setCategoryImages] = useState(Array(5).fill({ file: null, previewUrl: null }));
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setCategoryName("");
    setCategoryImages(Array(5).fill({ file: null, previewUrl: null }));
    setErrors({});
  };

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ images: "Please upload an image file" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCategoryImages(prev => {
      const updated = [...prev];
      updated[index] = { file, previewUrl };
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!categoryName.trim()) {
      newErrors.name = "Category name is required";
    }
    
    if (!categoryImages.some(img => img.file)) {
      newErrors.images = "Please upload at least one image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      showLoading();
      
      if (!currentUser) {
        throw new Error("You need to be logged in to submit a category.");
      }

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      
      formData.append("name", categoryName);
      categoryImages.forEach((image, index) => {
        if (image.file) {
          formData.append(`images[site${index + 1}]`, image.file);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}${API_ENDPOINTS.NEW_CATEGORY}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      showSuccess("Category created successfully!");
      resetForm();
      
      if (onCategoryAdded) {
        onCategoryAdded();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      hideLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="categoryName" className="card-label">
          Nombre de Categoría
        </label>
        <input
          type="text"
          id="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className={`input-field ${errors.name ? "error" : ""}`}
          placeholder="Introduzca nombre de la nueva categoría"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label className="card-label">Imágenes</label>
        <div className="image-container">
          {categoryImages.map((image, index) => (
            <div key={index} className="image-circle">
              <label htmlFor={`category-image-${index}`} className="image-upload-label">
                {image.previewUrl ? (
                  <img
                    src={image.previewUrl}
                    alt={`Category ${index + 1}`}
                    className="image-preview"
                  />
                ) : (
                  <span className="plus-sign">+</span>
                )}
              </label>
              <input
                type="file"
                id={`category-image-${index}`}
                className="image-upload-input"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, index)}
              />
            </div>
          ))}
        </div>
        {errors.images && <span className="error-message">{errors.images}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          Añadir categoría
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="secondary-button">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default CategoryForm;