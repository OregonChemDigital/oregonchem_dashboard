import React, { useState } from 'react';
import './UpdatePresentationForm.css';

const UpdatePresentationForm = ({ presentation, onSuccess }) => {
  const [name, setName] = useState(presentation.name || '');
  const [description, setDescription] = useState(presentation.description || '');
  const [images, setImages] = useState(presentation.images || []);
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
      setError('El nombre de la presentación es requerido');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/presentations/${presentation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          images
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la presentación');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating presentation:', error);
      setError('Error al actualizar la presentación');
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
        <label htmlFor="name">Nombre de la presentación</label>
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
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
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
        Actualizar Presentación
      </button>
    </form>
  );
};

export default UpdatePresentationForm; 