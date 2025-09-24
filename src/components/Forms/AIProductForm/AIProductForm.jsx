import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { useLoading } from '../../../contexts/loadingContext';
import { fetchWithCache, API_ENDPOINTS } from '../../../utils/api';
import {
  FRONTEND_OPTIONS,
  PRESENTATION_TYPES,
  PRESENTATION_TYPE_LABELS,
  mapSiteDataToArray,
  mapSiteImagesToArray
} from '../../../constants';
import {
  toggleSelection,
  handleArrayChange,
  handleImageUpload,
  validateArrayNotEmpty,
  validateSiteSpecificFields,
  prepareAIFormData,
  handleApiError,
  showSuccessMessage,
  resetFormState
} from '../../../utils/formUtils';
import "./AIProductForm.css";

const AIProductForm = ({ categories: propsCategories, onSuccess, initialData, onSubmit, submitButtonText = "Crear Producto con IA" }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    frontend: [],
    siteSpecificData: {},
    images: [],
    aiGeneratedImages: [],
    aiPrompt: '',
    presentationType: 'individual',
    presentationData: {
      individual: { title: '', description: '' },
      comparison: { title: '', description: '', comparisonItems: [] },
      showcase: { title: '', description: '', features: [] }
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        showLoading();
        const categoriesData = await fetchWithCache(API_ENDPOINTS.CATEGORIES);
        setCategories(categoriesData?.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Error al cargar las categorías');
      } finally {
        hideLoading();
        setLoading(false);
      }
    };

    if (!propsCategories) {
      fetchCategories();
    } else {
      setCategories(propsCategories);
      setLoading(false);
    }
  }, [propsCategories, showLoading, hideLoading]);

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData,
        frontend: initialData.frontend || [],
        siteSpecificData: initialData.siteSpecificData || {},
        images: initialData.images || [],
        aiGeneratedImages: initialData.aiGeneratedImages || []
      }));
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFrontendChange = (frontendId) => {
    const newFrontend = toggleSelection(formData.frontend, frontendId);
    setFormData(prev => ({
      ...prev,
      frontend: newFrontend,
      siteSpecificData: validateSiteSpecificFields(newFrontend, prev.siteSpecificData)
    }));
  };

  const handleSiteDataChange = (siteId, field, value) => {
    setFormData(prev => ({
      ...prev,
      siteSpecificData: {
        ...prev.siteSpecificData,
        [siteId]: {
          ...prev.siteSpecificData[siteId],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = await handleImageUpload(files, formData.images);
    setFormData(prev => ({
      ...prev,
      images: uploadedImages
    }));
  };

  const handleAIImageGeneration = async () => {
    if (!formData.aiPrompt.trim()) {
      alert('Por favor ingresa un prompt para generar imágenes');
      return;
    }

    try {
      showLoading();
      const response = await fetch(`${API_ENDPOINTS.AI_GENERATE_IMAGES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.accessToken}`
        },
        body: JSON.stringify({
          prompt: formData.aiPrompt,
          count: 4
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar imágenes con IA');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        aiGeneratedImages: [...prev.aiGeneratedImages, ...data.images]
      }));
    } catch (err) {
      handleApiError(err, 'Error al generar imágenes con IA');
    } finally {
      hideLoading();
    }
  };

  const handlePresentationDataChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      presentationData: {
        ...prev.presentationData,
        [type]: {
          ...prev.presentationData[type],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (type, field, value) => {
    const updatedData = handleArrayChange(formData.presentationData[type], field, value);
    setFormData(prev => ({
      ...prev,
      presentationData: {
        ...prev.presentationData,
        [type]: updatedData
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateArrayNotEmpty(formData.frontend, 'frontend')) return;
    if (!validateSiteSpecificFields(formData.frontend, formData.siteSpecificData)) return;

    try {
      showLoading();
      const preparedData = prepareAIFormData(formData, currentUser);
      
      if (onSubmit) {
        await onSubmit(preparedData);
      } else {
        const response = await fetch(API_ENDPOINTS.PRODUCTS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.accessToken}`
          },
          body: JSON.stringify(preparedData)
        });

        if (!response.ok) {
          throw new Error('Error al crear el producto');
        }
      }

      showSuccessMessage('Producto creado exitosamente con IA');
      resetFormState(setFormData);
      if (onSuccess) onSuccess();
    } catch (err) {
      handleApiError(err, 'Error al crear el producto');
    } finally {
      hideLoading();
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <h2>Crear Producto con IA</h2>
        
        {/* Basic Information */}
        <div className="form-group">
          <label htmlFor="name">Nombre del Producto *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Precio *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Frontend Selection */}
        <div className="form-group">
          <label>Frontends *</label>
          <div className="checkbox-group">
            {FRONTEND_OPTIONS.map(option => (
              <label key={option.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.frontend.includes(option.id)}
                  onChange={() => handleFrontendChange(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Site-specific data */}
        {formData.frontend.map(siteId => {
          const siteOption = FRONTEND_OPTIONS.find(opt => opt.id === siteId);
          return (
            <div key={siteId} className="site-specific-section">
              <h3>Datos para {siteOption?.label}</h3>
              <div className="form-group">
                <label htmlFor={`${siteId}-title`}>Título específico</label>
                <input
                  type="text"
                  id={`${siteId}-title`}
                  value={formData.siteSpecificData[siteId]?.title || ''}
                  onChange={(e) => handleSiteDataChange(siteId, 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`${siteId}-description`}>Descripción específica</label>
                <textarea
                  id={`${siteId}-description`}
                  value={formData.siteSpecificData[siteId]?.description || ''}
                  onChange={(e) => handleSiteDataChange(siteId, 'description', e.target.value)}
                />
              </div>
            </div>
          );
        })}

        {/* AI Image Generation */}
        <div className="form-group">
          <label htmlFor="aiPrompt">Prompt para IA</label>
          <textarea
            id="aiPrompt"
            name="aiPrompt"
            value={formData.aiPrompt}
            onChange={handleInputChange}
            placeholder="Describe las imágenes que quieres generar con IA..."
          />
          <button
            type="button"
            onClick={handleAIImageGeneration}
            className="ai-generate-button"
          >
            Generar Imágenes con IA
          </button>
        </div>

        {/* Generated Images */}
        {formData.aiGeneratedImages.length > 0 && (
          <div className="generated-images-section">
            <h3>Imágenes Generadas por IA</h3>
            <div className="image-grid">
              {formData.aiGeneratedImages.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image.url} alt={`AI Generated ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Image Upload */}
        <div className="form-group">
          <label htmlFor="images">Imágenes</label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* Presentation Type */}
        <div className="form-group">
          <label htmlFor="presentationType">Tipo de Presentación</label>
          <select
            id="presentationType"
            name="presentationType"
            value={formData.presentationType}
            onChange={handleInputChange}
          >
            {PRESENTATION_TYPES.map(type => (
              <option key={type} value={type}>
                {PRESENTATION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Presentation Data */}
        <div className="presentation-data-section">
          <h3>Datos de Presentación</h3>
          {formData.presentationType === 'individual' && (
            <div className="presentation-form">
              <div className="form-group">
                <label htmlFor="individual-title">Título</label>
                <input
                  type="text"
                  id="individual-title"
                  value={formData.presentationData.individual.title}
                  onChange={(e) => handlePresentationDataChange('individual', 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="individual-description">Descripción</label>
                <textarea
                  id="individual-description"
                  value={formData.presentationData.individual.description}
                  onChange={(e) => handlePresentationDataChange('individual', 'description', e.target.value)}
                />
              </div>
            </div>
          )}

          {formData.presentationType === 'comparison' && (
            <div className="presentation-form">
              <div className="form-group">
                <label htmlFor="comparison-title">Título</label>
                <input
                  type="text"
                  id="comparison-title"
                  value={formData.presentationData.comparison.title}
                  onChange={(e) => handlePresentationDataChange('comparison', 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="comparison-description">Descripción</label>
                <textarea
                  id="comparison-description"
                  value={formData.presentationData.comparison.description}
                  onChange={(e) => handlePresentationDataChange('comparison', 'description', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Elementos de Comparación</label>
                {formData.presentationData.comparison.comparisonItems.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('comparison', 'comparisonItems', e.target.value, index)}
                    placeholder={`Elemento ${index + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => handleArrayChange('comparison', 'comparisonItems', '', -1)}
                >
                  Agregar Elemento
                </button>
              </div>
            </div>
          )}

          {formData.presentationType === 'showcase' && (
            <div className="presentation-form">
              <div className="form-group">
                <label htmlFor="showcase-title">Título</label>
                <input
                  type="text"
                  id="showcase-title"
                  value={formData.presentationData.showcase.title}
                  onChange={(e) => handlePresentationDataChange('showcase', 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="showcase-description">Descripción</label>
                <textarea
                  id="showcase-description"
                  value={formData.presentationData.showcase.description}
                  onChange={(e) => handlePresentationDataChange('showcase', 'description', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Características</label>
                {formData.presentationData.showcase.features.map((feature, index) => (
                  <input
                    key={index}
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayChange('showcase', 'features', e.target.value, index)}
                    placeholder={`Característica ${index + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => handleArrayChange('showcase', 'features', '', -1)}
                >
                  Agregar Característica
                </button>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          {submitButtonText}
        </button>
      </form>
    </div>
  );
};

export default AIProductForm;