import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { fetchWithCache, API_ENDPOINTS } from '../../utils/api';
import "./Forms.css";

const AIProductForm = ({ categories: propsCategories, onSuccess, initialData, onSubmit, submitButtonText = "Crear Producto con IA" }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [productName, setProductName] = useState(initialData?.name || "");
  const [selectedCategories, setSelectedCategories] = useState(initialData?.categories || []);
  const [selectedFrontends, setSelectedFrontends] = useState(initialData?.frontends || ['site1']);
  const [descriptions, setDescriptions] = useState(initialData?.descriptions || {});
  const [uses, setUses] = useState(initialData?.uses || {});
  const [productImages, setProductImages] = useState(initialData?.images || {});
  const [aiPrompt, setAiPrompt] = useState(initialData?.aiPrompt || "");
  const [generatedImages, setGeneratedImages] = useState(initialData?.generatedImages || []);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState(initialData?.selectedGeneratedImage || null);
  const [errors, setErrors] = useState({});

  const FRONTEND_OPTIONS = [
    { id: 'site1', label: 'Química Industrial' },
    { id: 'site2', label: 'Site 2' },
    { id: 'site3', label: 'Site 3' },
    { id: 'site4', label: 'Site 4' },
    { id: 'site5', label: 'Site 5' }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        showLoading();
        const categoriesData = await fetchWithCache(API_ENDPOINTS.CATEGORIES);
        setCategories(categoriesData?.data || []);
      } catch (err) {
        setError(err);
        showSuccess(`Error fetching categories: ${err.message}`, false);
      } finally {
        hideLoading();
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.name || "");
      setSelectedCategories(initialData.categories || []);
      setSelectedFrontends(initialData.frontends || ['site1']);
      setDescriptions(initialData.descriptions || {});
      setUses(initialData.uses || {});
      setProductImages(initialData.images || {});
      setAiPrompt(initialData.aiPrompt || "");
      setGeneratedImages(initialData.generatedImages || []);
      setSelectedGeneratedImage(initialData.selectedGeneratedImage || null);
    }
  }, [initialData]);

  const handleImageUpload = (event, siteId) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImages(prev => ({
          ...prev,
          [siteId]: {
            file: file,
            previewUrl: e.target.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImages = async () => {
    if (!aiPrompt.trim()) {
      setErrors(prev => ({ ...prev, aiPrompt: "El prompt de IA es requerido para generar imágenes." }));
      return;
    }
    setErrors(prev => ({ ...prev, aiPrompt: null }));
    showLoading();
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}${API_ENDPOINTS.GENERATE_AI_IMAGE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate AI images');
      }

      const result = await response.json();
      setGeneratedImages(result.images);
      setSelectedGeneratedImage(null);
      showSuccess("Imágenes generadas exitosamente!");
    } catch (err) {
      setErrors(prev => ({ ...prev, aiPrompt: err.message }));
    } finally {
      hideLoading();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!productName.trim()) {
      newErrors.productName = "Nombre del producto es requerido";
    }

    if (selectedCategories.length === 0) {
      newErrors.categories = "Debe seleccionar al menos una categoría";
    }

    if (selectedFrontends.length === 0) {
      newErrors.frontends = "Debe seleccionar al menos un frontend";
    }

    selectedFrontends.forEach(frontend => {
      if (!descriptions[frontend]?.trim()) {
        newErrors[`description${frontend}`] = `Descripción para ${FRONTEND_OPTIONS.find(f => f.id === frontend)?.label} es requerida`;
      }
      if (!uses[frontend]?.trim()) {
        newErrors[`use${frontend}`] = `Usos para ${FRONTEND_OPTIONS.find(f => f.id === frontend)?.label} son requeridos`;
      }
    });

    if (!selectedGeneratedImage && generatedImages.length > 0) {
      newErrors.generatedImages = "Por favor, seleccione una imagen generada por IA o suba una imagen.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showSuccess("Por favor, corrija los errores en el formulario.", false);
      return;
    }

    try {
      showLoading();
      if (!currentUser) {
        throw new Error("You need to be logged in to create a product.");
      }

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      
      formData.append('name', productName);
      formData.append('categories', JSON.stringify(selectedCategories));
      formData.append('frontends', JSON.stringify(selectedFrontends));
      formData.append('descriptions', JSON.stringify(descriptions));
      formData.append('uses', JSON.stringify(uses));
      formData.append('aiPrompt', aiPrompt);
      
      if (selectedGeneratedImage) {
        formData.append('selectedGeneratedImage', selectedGeneratedImage);
      }

      selectedFrontends.forEach(frontend => {
        if (productImages[frontend]?.file) {
          formData.append(`images`, productImages[frontend].file);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}${API_ENDPOINTS.NEW_PRODUCT}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const result = await response.json();
      
      // Reset form
      setProductName("");
      setSelectedCategories([]);
      setSelectedFrontends(['site1']);
      setDescriptions({});
      setUses({});
      setProductImages({});
      setAiPrompt("");
      setGeneratedImages([]);
      setSelectedGeneratedImage(null);
      setErrors({});

      showSuccess("Product added successfully!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      hideLoading();
    }
  };

  if (loading) return <div className="loading">Cargando categorías...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="form-container">
      <form onSubmit={onSubmit || handleSubmit}>
        <div className="form-group">
          <label htmlFor="product-name" className="card-label">
            Nombre del Producto:
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Ingresar nombre"
            className={`input-field ${errors.productName ? "error" : ""}`}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          {errors.productName && <span className="error-message">{errors.productName}</span>}
        </div>

        <div className="form-group">
          <label className="card-label">Categorías:</label>
          <div className="checkbox-group">
            {categories.map((category) => (
              <label key={category._id} className="checkbox-label">
                <input
                  type="checkbox"
                  value={category._id}
                  checked={selectedCategories.includes(category._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category._id]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(id => id !== category._id));
                    }
                  }}
                />
                {category.name}
              </label>
            ))}
          </div>
          {errors.categories && <span className="error-message">{errors.categories}</span>}
        </div>

        <div className="form-group">
          <label className="card-label">Frontends:</label>
          <div className="checkbox-group">
            {FRONTEND_OPTIONS.map((option) => (
              <label key={option.id} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option.id}
                  checked={selectedFrontends.includes(option.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFrontends([...selectedFrontends, option.id]);
                    } else {
                      setSelectedFrontends(selectedFrontends.filter(id => id !== option.id));
                    }
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.frontends && <span className="error-message">{errors.frontends}</span>}
        </div>

        <div className="form-group">
          <label className="card-label">Descripciones:</label>
          {selectedFrontends.map((frontend) => (
            <div key={frontend} className="frontend-input-group">
              <label className="frontend-label">{FRONTEND_OPTIONS.find(f => f.id === frontend)?.label}</label>
              <input
                value={descriptions[frontend] || ""}
                onChange={(e) => setDescriptions(prev => ({ ...prev, [frontend]: e.target.value }))}
                placeholder={`Descripción ${FRONTEND_OPTIONS.find(f => f.id === frontend)?.label}`}
                className={`input-field ${errors[`description${frontend}`] ? "error" : ""}`}
              />
              {errors[`description${frontend}`] && (
                <span className="error-message">{errors[`description${frontend}`]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="card-label">Usos:</label>
          {selectedFrontends.map((frontend) => (
            <div key={frontend} className="frontend-input-group">
              <label className="frontend-label">{FRONTEND_OPTIONS.find(f => f.id === frontend)?.label}</label>
              <input
                value={uses[frontend] || ""}
                onChange={(e) => setUses(prev => ({ ...prev, [frontend]: e.target.value }))}
                placeholder={`Usos para ${FRONTEND_OPTIONS.find(f => f.id === frontend)?.label} (separados por comas)`}
                className={`input-field ${errors[`use${frontend}`] ? "error" : ""}`}
              />
              {errors[`use${frontend}`] && (
                <span className="error-message">{errors[`use${frontend}`]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="card-label">Imágenes del Producto:</label>
          <p className="helper-text">
            Puedes subir tus propias imágenes o generar con IA.
          </p>
          <div className="image-container">
            {selectedFrontends.map((frontend) => (
              <div key={frontend} className="frontend-image-group">
                <label className="frontend-label">{FRONTEND_OPTIONS.find(f => f.id === frontend)?.label}</label>
                <div className="image-circle">
                  <label
                    htmlFor={`product-image-${frontend}`}
                    className="image-upload-label"
                  >
                    {productImages[frontend]?.previewUrl ? (
                      <img
                        src={productImages[frontend].previewUrl}
                        alt={`Product ${FRONTEND_OPTIONS.find(f => f.id === frontend)?.label}`}
                        className="image-preview"
                      />
                    ) : (
                      <span className="plus-sign">+</span>
                    )}
                  </label>
                  <input
                    type="file"
                    id={`product-image-${frontend}`}
                    className="image-upload-input"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event, frontend)}
                  />
                </div>
                {errors[`image${frontend}`] && (
                  <span className="error-message">{errors[`image${frontend}`]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group prompt-editing-sections">
          <label htmlFor="ai-prompt" className="card-label">
            Prompt para Generación de Imágenes con IA:
          </label>
          <textarea
            id="ai-prompt"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className={`textarea-field ${errors.aiPrompt ? "error" : ""}`}
            placeholder="Describe la imagen que deseas generar para el producto..."
            rows="4"
          />
          {errors.aiPrompt && <span className="error-message">{errors.aiPrompt}</span>}
          <button
            type="button"
            onClick={handleGenerateImages}
            className="ai-generate-button"
            disabled={!aiPrompt.trim()}
          >
            Generar Imágenes con IA
          </button>
        </div>

        {generatedImages.length > 0 && (
          <div className="form-group generated-images-section">
            <label className="card-label">Imágenes Generadas por IA:</label>
            <div className="template-grid">
              {generatedImages.map((image, index) => (
                <div
                  key={index}
                  className={`template-selection ${selectedGeneratedImage === image ? "selected" : ""}`}
                  onClick={() => setSelectedGeneratedImage(image)}
                >
                  <img src={image} alt={`Generated ${index + 1}`} />
                </div>
              ))}
            </div>
            {errors.generatedImages && <span className="error-message">{errors.generatedImages}</span>}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {submitButtonText}
          </button>
          {errors.submit && <span className="error-message">{errors.submit}</span>}
        </div>
      </form>
    </div>
  );
};

export default AIProductForm;
