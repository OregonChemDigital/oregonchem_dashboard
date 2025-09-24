import React, { useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import './UpdatePresentationForm.css';

const UpdatePresentationForm = ({ presentation, onSuccess }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [name, setName] = useState(presentation.name || '');
  const [promptText, setPromptText] = useState(presentation.promptText || '');
  const [templateImage, setTemplateImage] = useState(presentation.templateImage || "");
  const [templateImagePreview, setTemplateImagePreview] = useState(presentation.templateImage || null);
  const [error, setError] = useState('');

  const handleTemplateImageFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      setError("Por favor suba un archivo de texto (.txt) con datos base64");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      setTemplateImage(base64String);
      
      // Try to create preview if it's a valid base64 image
      if (base64String.startsWith('data:image/')) {
        setTemplateImagePreview(base64String);
      } else if (base64String.startsWith('iVBORw0KGgo') || base64String.startsWith('/9j/')) {
        // Handle base64 without data URL prefix
        const dataUrl = `data:image/png;base64,${base64String}`;
        setTemplateImagePreview(dataUrl);
      }
    };
    reader.readAsText(file);
  };

  const handleTemplateImageTextChange = (event) => {
    const value = event.target.value;
    setTemplateImage(value);
    
    // Try to create preview if it's a valid base64 image
    if (value.startsWith('data:image/')) {
      setTemplateImagePreview(value);
    } else if (value.startsWith('iVBORw0KGgo') || value.startsWith('/9j/')) {
      // Handle base64 without data URL prefix
      const dataUrl = `data:image/png;base64,${value}`;
      setTemplateImagePreview(dataUrl);
    } else {
      setTemplateImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre de la presentación es requerido');
      return;
    }

    if (!promptText.trim()) {
      setError('El texto del prompt es requerido');
      return;
    }

    if (!templateImage.trim()) {
      setError('La imagen template (base64) es requerida');
      return;
    }

    try {
      showLoading();
      
      if (!currentUser) {
        throw new Error("Necesita estar conectado para actualizar una presentación");
      }

      const token = await currentUser.getIdToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/presentaciones/${presentation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          promptText: promptText.trim(),
          templateImage: templateImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la presentación');
      }

      showSuccess("Presentación actualizada exitosamente!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating presentation:', error);
      setError(error.message || 'Error al actualizar la presentación');
    } finally {
      hideLoading();
    }
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
      </div>

      <div className="form-group">
        <label htmlFor="promptText">Texto del prompt para IA</label>
        <textarea
          id="promptText"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={6}
          className={error ? 'error' : ''}
        />
      </div>

      <div className="form-group">
        <label className="card-label">Imagen Template (Base64):</label>
        
        {/* Text Input Option */}
        <div className="form-group">
          <label htmlFor="template-image-text" className="card-label">
            Pegar datos Base64 directamente:
          </label>
          <textarea
            id="template-image-text"
            value={templateImage}
            onChange={handleTemplateImageTextChange}
            className={`input-field ${error ? 'error' : ''}`}
            placeholder="Pegue aquí los datos base64 de la imagen template..."
            rows="4"
          />
        </div>

        {/* File Upload Option */}
        <div className="form-group">
          <label htmlFor="template-image-file" className="card-label">
            O subir archivo .txt con datos Base64:
          </label>
          <input
            type="file"
            id="template-image-file"
            className="file-input"
            accept=".txt"
            onChange={handleTemplateImageFileUpload}
          />
        </div>

        {/* Preview */}
        {templateImagePreview && (
          <div className="form-group">
            <label className="card-label">Vista previa:</label>
            <div className="image-container">
              <div className="image-circle">
                <img
                  src={templateImagePreview}
                  alt="Template Preview"
                  className="image-preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="form-group">
          <span className="error-message">{error}</span>
        </div>
      )}

      <button type="submit" className="submit-button">
        Actualizar Presentación
      </button>
    </form>
  );
};

export default UpdatePresentationForm; 