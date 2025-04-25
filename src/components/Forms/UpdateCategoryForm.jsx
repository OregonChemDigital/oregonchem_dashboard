import React, { useState } from 'react';
import './UpdateCategoryForm.css';

const UpdateCategoryForm = ({ category, onSuccess }) => {
  const [name, setName] = useState(category.name || '');
  const [images, setImages] = useState(category.images || []);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images];
    
    files.forEach(file => {
      if (newImages.length < 5) {
        const reader = new FileReader();
        reader.onload = () => {
          newImages.push(reader.result);
          setImages(newImages);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          images
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Error al actualizar la categoría');
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <form onSubmit={handleSubmit} className="update-form">
      <div className="form-group">
        <label htmlFor="name">Nombre de la categoría</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={error ? 'error' : ''}
        />
        {error && <span className="error-message">{error}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="images">Imágenes (máximo 5)</label>
        <input
          type="file"
          id="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="file-input"
        />
      </div>

      {images.length > 0 && (
        <div className="image-preview-container">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="remove-image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="submit" className="submit-button">
        Actualizar Categoría
      </button>
    </form>
  );
};

export default UpdateCategoryForm; 