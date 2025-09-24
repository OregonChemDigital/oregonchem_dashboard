import React, { useState } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { API_ENDPOINTS } from '../../utils/api';
import "./Forms.css";

const PresentationForm = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [name, setName] = useState("");
  const [promptText, setPromptText] = useState("");
  const [templateImage, setTemplateImage] = useState("");
  const [templateImagePreview, setTemplateImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setName("");
    setPromptText("");
    setTemplateImage("");
    setTemplateImagePreview(null);
    setErrors({});
  };

  const handleTemplateImageFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      setErrors({ templateImage: "Por favor suba un archivo de texto (.txt) con datos base64" });
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


  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "El nombre de la presentación es requerido";
    }
    
    if (!promptText.trim()) {
      newErrors.promptText = "El texto del prompt es requerido";
    }
    
    if (!templateImage.trim()) {
      newErrors.templateImage = "La imagen template (base64) es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      showLoading();
      
      if (!currentUser) {
        throw new Error("Necesita estar conectado para enviar una presentación");
      }

      const token = await currentUser.getIdToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/presentaciones/nueva`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(errorData.message || 'Error al crear la presentación');
      }

      showSuccess("Presentación creada exitosamente!");
      resetForm();
      
      if (onSuccess) {
        onSuccess();
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
        <label htmlFor="name" className="card-label">
          Nombre de la presentación:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`input-field ${errors.name ? "error" : ""}`}
          placeholder="Introduzca el nombre de la presentación"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="promptText" className="card-label">
          Texto del prompt para IA:
        </label>
        <textarea
          id="promptText"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className={`input-field ${errors.promptText ? "error" : ""}`}
          placeholder="Introduzca el prompt que se usará para generar imágenes con IA"
          rows="6"
        />
        {errors.promptText && <span className="error-message">{errors.promptText}</span>}
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
            className={`input-field ${errors.templateImage ? "error" : ""}`}
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

        {errors.templateImage && <span className="error-message">{errors.templateImage}</span>}
      </div>

      {errors.submit && (
        <div className="form-group">
          <span className="error-message">{errors.submit}</span>
        </div>
      )}

      <div className="form-group">
        <button type="submit" className="submit-button">
          Crear presentación
        </button>
      </div>
    </form>
  );
};

export default PresentationForm;