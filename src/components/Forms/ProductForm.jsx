import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { fetchWithCache, API_ENDPOINTS, API_URL } from '../../utils/api';
import "./Forms.css";

const FRONTEND_OPTIONS = [
  { id: 'site1', label: 'Química Industrial' },
  { id: 'site2', label: 'Frontend 2' },
  { id: 'site3', label: 'Frontend 3' },
  { id: 'site4', label: 'Frontend 4' },
  { id: 'site5', label: 'Frontend 5' }
];

const ProductForm = ({ presentations: propsPresentations, categories: propsCategories, onSuccess, initialData, onSubmit, submitButtonText = "Añadir producto", isQuimicaIndustrial = false }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [presentations, setPresentations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPresentations, setSelectedPresentations] = useState(initialData?.presentations || []);
  const [selectedCategories, setSelectedCategories] = useState(initialData?.categories || []);
  const [selectedFrontends, setSelectedFrontends] = useState(initialData?.frontends || ['site1']);
  const [descriptions, setDescriptions] = useState(initialData?.descriptions || {});
  const [uses, setUses] = useState(initialData?.uses || {});
  const [prices, setPrices] = useState(initialData?.prices || {});
  const [productImages, setProductImages] = useState(
    initialData?.images ? Object.entries(initialData.images).map(([site, url]) => ({ 
      site, 
      file: null, 
      previewUrl: url 
    })) : []
  );
  const [presentationPrompts, setPresentationPrompts] = useState({});
  const [presentationQuantities, setPresentationQuantities] = useState({});
  const [generatedImages, setGeneratedImages] = useState({});
  const [selectedGeneratedImages, setSelectedGeneratedImages] = useState([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
        setErrors({});

        const [presentationsData, categoriesData] = await Promise.all([
          fetchWithCache(API_ENDPOINTS.PRESENTATIONS),
          fetchWithCache(API_ENDPOINTS.CATEGORIES)
        ]);

        setPresentations(propsPresentations || presentationsData?.data || []);
        setCategories(propsCategories || categoriesData?.data || []);
      } catch (error) {
        setErrors({ fetch: error.message });
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    if (!propsPresentations || !propsCategories) {
      fetchData();
    } else {
      setPresentations(propsPresentations);
      setCategories(propsCategories);
      setLoading(false);
    }
  }, []);

  // Remove the filtered presentations logic since we're now using the new Presentation model

  const handleImageUpload = (event, siteId) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ images: "Please upload an image file" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProductImages((prev) => {
      const existing = prev.find(img => img.site === siteId);
      if (existing) {
        return prev.map(img => 
          img.site === siteId ? { ...img, file, previewUrl } : img
        );
      } else {
        return [...prev, { site: siteId, file, previewUrl }];
      }
    });
  };

  const toggleSelection = (array, setArray, itemId) => {
    setArray((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleFieldChange = (field, siteId, value) => {
    if (field === 'descriptions') {
      setDescriptions(prev => ({ ...prev, [siteId]: value }));
    } else if (field === 'uses') {
      setUses(prev => ({ ...prev, [siteId]: value }));
    } else if (field === 'prices') {
      setPrices(prev => ({ ...prev, [siteId]: value }));
    }
  };

  const handleGenerateImages = async () => {
    if (selectedPresentations.length === 0) {
      setErrors({ presentations: "Seleccione al menos una presentación" });
      return;
    }

    try {
      setIsGeneratingImages(true);
      setErrors({});

      if (!currentUser) {
        throw new Error("Necesita estar conectado para generar imágenes");
      }

      const token = await currentUser.getIdToken();
      const productName = document.getElementById("product-name").value;

      // Prepare presentations data in the format expected by the API
      const presentaciones = [];
      
      for (const presentationId of selectedPresentations) {
        const presentation = presentations.find(p => p._id === presentationId);
        const quantities = presentationQuantities[presentationId]?.split(',').map(q => q.trim()).filter(q => q) || ['default'];
        
        // Add an entry for each quantity
        quantities.forEach(quantity => {
          presentaciones.push({
            id: presentationId,
            presentacion: quantity,
            templateName: presentation.name
          });
        });
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          producto: productName,
          presentaciones: presentaciones
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generando imágenes');
      }

      const result = await response.json();
      
      if (result.success && result.results) {
        const newGeneratedImages = {};
        
        result.results.forEach((imageResult, index) => {
          if (imageResult.success && imageResult.imageData) {
            const imageKey = `${imageResult.presentationId}_${imageResult.presentacion}`;
            newGeneratedImages[imageKey] = {
              url: `data:${imageResult.mimeType};base64,${imageResult.imageData}`,
              presentationName: imageResult.presentationName,
              quantity: imageResult.presentacion,
              presentationId: imageResult.presentationId
            };
          }
        });

        setGeneratedImages(prev => ({ ...prev, ...newGeneratedImages }));
        showSuccess("Imágenes generadas exitosamente!");
      } else {
        throw new Error('Error en la generación de imágenes');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      setErrors({ imageGeneration: error.message });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleRegenerateImage = async (imageKey) => {
    try {
      setIsGeneratingImages(true);
      
      if (!currentUser) {
        throw new Error("Necesita estar conectado para regenerar imágenes");
      }

      const token = await currentUser.getIdToken();
      const imageData = generatedImages[imageKey];
      const productName = document.getElementById("product-name").value;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          producto: productName,
          presentaciones: [{
            id: imageData.presentationId,
            presentacion: imageData.quantity,
            templateName: imageData.presentationName
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error regenerando imagen para ${imageData.presentationName} - ${imageData.quantity}`);
      }

      const result = await response.json();
      
      if (result.success && result.results && result.results.length > 0) {
        const imageResult = result.results[0];
        if (imageResult.success && imageResult.imageData) {
          setGeneratedImages(prev => ({
            ...prev,
            [imageKey]: {
              ...prev[imageKey],
              url: `data:${imageResult.mimeType};base64,${imageResult.imageData}`
            }
          }));
          showSuccess("Imagen regenerada exitosamente!");
        } else {
          throw new Error(imageResult.error || 'Error regenerando imagen');
        }
      } else {
        throw new Error('Error en la regeneración de imagen');
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      setErrors({ imageRegeneration: error.message });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (selectedPresentations.length === 0) {
      newErrors.presentations = "Please select at least one presentation";
    }
    
    if (selectedCategories.length === 0) {
      newErrors.categories = "Please select at least one category";
    }

    if (selectedFrontends.length === 0) {
      newErrors.frontends = "Please select at least one frontend";
    }
    
    // Only validate descriptions, uses, images, and prices for selected frontends
    selectedFrontends.forEach((frontend) => {
      const frontendOption = FRONTEND_OPTIONS.find(f => f.id === frontend);
      if (!descriptions[frontend]?.trim()) {
        newErrors[`description${frontend}`] = `Description for ${frontendOption?.label} is required`;
      }
      if (!uses[frontend]?.trim()) {
        newErrors[`use${frontend}`] = `Use for ${frontendOption?.label} is required`;
      }
      if (!prices[frontend] || prices[frontend] <= 0) {
        newErrors[`price${frontend}`] = `Price for ${frontendOption?.label} is required`;
      }
      
      const imageForSite = productImages.find(img => img.site === frontend);
      if (!imageForSite?.file && !imageForSite?.previewUrl) {
        newErrors[`image${frontend}`] = `Image for ${frontendOption?.label} is required`;
      }
    });

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
        throw new Error("You need to be logged in to submit a product.");
      }

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      const productName = document.getElementById("product-name").value;
      formData.append("name", productName);
      selectedPresentations.forEach(p => formData.append("presentations[]", p));
      selectedCategories.forEach(c => formData.append("categories[]", c));
      selectedFrontends.forEach(f => formData.append("frontends[]", f));

      // Only include data for selected frontends
      selectedFrontends.forEach((frontend) => {
        formData.append(`descriptions[${frontend}]`, descriptions[frontend] || "");
        formData.append(`uses[${frontend}]`, uses[frontend] || "");
        formData.append(`prices[${frontend}]`, prices[frontend] || "");
        
        const imageForSite = productImages.find(img => img.site === frontend);
        if (imageForSite?.file) {
          formData.append(`images[${frontend}]`, imageForSite.file);
        }
      });

      // Include selected generated images
      selectedGeneratedImages.forEach((imageKey) => {
        const imageData = generatedImages[imageKey];
        if (imageData) {
          formData.append(`generatedImages[${imageKey}]`, imageData.url);
          formData.append(`generatedImageData[${imageKey}]`, JSON.stringify({
            presentationName: imageData.presentationName,
            quantity: imageData.quantity,
            presentationId: imageData.presentationId
          }));
        }
      });

      const response = await fetch(`${API_URL}${API_ENDPOINTS.NEW_PRODUCT}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const textResponse = await response.text();
        throw new Error(`Server error: ${textResponse}`);
      }

      const result = await response.json();

      // Reset the form on successful submission
      setProductImages([]);
      setDescriptions({});
      setUses({});
      setPrices({});
      setSelectedPresentations([]);
      setSelectedCategories([]);
      setSelectedFrontends(['site1']);
      setErrors({});
      
      showSuccess("Product added successfully!");
      
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
    <div className="form-container">
      <form onSubmit={onSubmit || handleSubmit}>
        {/* Product Name */}
        <div className="form-group">
          <label htmlFor="product-name" className="card-label">
            Nombre del Producto
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Ingresar nombre del producto"
            className="input-field"
            defaultValue={initialData?.name}
          />
          {errors.productName && <span className="error-message">{errors.productName}</span>}
        </div>


        {/* Categories Selection */}
        <div className="form-group">
          <label className="card-label">Categorías</label>
          <div className="categories-body">
            {categories && categories.map((category) => (
              <div key={category._id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`category-${category._id}`}
                  name="categories"
                  value={category._id}
                  checked={selectedCategories.includes(category._id)}
                  onChange={() =>
                    toggleSelection(
                      selectedCategories,
                      setSelectedCategories,
                      category._id
                    )
                  }
                />
                <label htmlFor={`category-${category._id}`}>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
          {errors.categories && <span className="error-message">{errors.categories}</span>}
        </div>

        {/* Frontends Selection */}
        <div className="form-group">
          <label className="card-label">Frontends</label>
          <div className="frontends-body">
            {FRONTEND_OPTIONS.map((frontend) => (
              <div key={frontend.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`frontend-${frontend.id}`}
                  name="frontends"
                  value={frontend.id}
                  checked={selectedFrontends.includes(frontend.id)}
                  onChange={() => {
                    setSelectedFrontends(prev =>
                      prev.includes(frontend.id)
                        ? prev.filter(id => id !== frontend.id)
                        : [...prev, frontend.id]
                    );
                  }}
                />
                <label htmlFor={`frontend-${frontend.id}`}>
                  {frontend.label}
                </label>
              </div>
            ))}
          </div>
          {errors.frontends && <span className="error-message">{errors.frontends}</span>}
        </div>

        {/* 4. Descriptions 1-5 (for selected frontends) */}
        {selectedFrontends.length > 0 && (
          <div className="form-group">
            <h2 className="section-title">Descripciones por Frontend</h2>
            {selectedFrontends.map((frontend) => {
              const frontendOption = FRONTEND_OPTIONS.find(f => f.id === frontend);
              return (
                <div key={frontend} className="frontend-field-group">
                  <label className="card-label">{frontendOption?.label} - Descripción</label>
                  <textarea
                    value={descriptions[frontend] || ""}
                    onChange={(e) => handleFieldChange('descriptions', frontend, e.target.value)}
                    placeholder={`Descripción para ${frontendOption?.label}`}
                    className={`input-field ${errors[`description${frontend}`] ? "error" : ""}`}
                    rows="3"
                  />
                  {errors[`description${frontend}`] && (
                    <span className="error-message">{errors[`description${frontend}`]}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Uses 1-5 (for selected frontends) */}
        {selectedFrontends.length > 0 && (
          <div className="form-group">
            <h2 className="section-title">Usos por Frontend</h2>
            <p className="helper-text">
              Ingrese los usos separados por comas. Estos se utilizarán como palabras clave para SEO.
              Ejemplo: "limpieza industrial, desinfección, sanitización, limpieza de superficies"
            </p>
            {selectedFrontends.map((frontend) => {
              const frontendOption = FRONTEND_OPTIONS.find(f => f.id === frontend);
              return (
                <div key={frontend} className="frontend-field-group">
                  <label className="card-label">{frontendOption?.label} - Usos</label>
                  <input
                    value={uses[frontend] || ""}
                    onChange={(e) => handleFieldChange('uses', frontend, e.target.value)}
                    placeholder={`Usos para ${frontendOption?.label} (separados por comas)`}
                    className={`input-field ${errors[`use${frontend}`] ? "error" : ""}`}
                  />
                  {errors[`use${frontend}`] && (
                    <span className="error-message">{errors[`use${frontend}`]}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Prices 1-5 (for selected frontends) */}
        {selectedFrontends.length > 0 && (
          <div className="form-group">
            <h2 className="section-title">Precios por Frontend</h2>
            {selectedFrontends.map((frontend) => {
              const frontendOption = FRONTEND_OPTIONS.find(f => f.id === frontend);
              return (
                <div key={frontend} className="frontend-field-group">
                  <label className="card-label">{frontendOption?.label} - Precio</label>
                  <input
                    type="number"
                    value={prices[frontend] || ""}
                    onChange={(e) => handleFieldChange('prices', frontend, parseFloat(e.target.value))}
                    placeholder={`Precio para ${frontendOption?.label}`}
                    className={`input-field ${errors[`price${frontend}`] ? "error" : ""}`}
                    min="0"
                    step="0.01"
                  />
                  {errors[`price${frontend}`] && (
                    <span className="error-message">{errors[`price${frontend}`]}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 7. Complete Presentation Select Section with GENERATE button */}
        <div className="form-group presentations-section">
          <h2 className="section-title">Presentaciones</h2>
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              Debug: {presentations ? presentations.length : 0} presentations loaded
              {presentations && presentations.length > 0 && (
                <div style={{ marginTop: '5px' }}>
                  First presentation templateImage: {presentations[0].templateImage ? presentations[0].templateImage.substring(0, 50) + '...' : 'No template image'}
                </div>
              )}
            </div>
          )}
          
          {/* Presentation Selector */}
          <div className="form-group">
            <label className="card-label">Seleccionar Presentaciones</label>
            <div className="presentation-grid">
              {presentations && presentations.length > 0 ? (
                presentations.map((presentation) => (
                  <div 
                    key={presentation._id} 
                    className={`presentation-card ${selectedPresentations.includes(presentation._id) ? 'selected' : ''}`}
                    onClick={() => toggleSelection(selectedPresentations, setSelectedPresentations, presentation._id)}
                  >
                    <div className="presentation-image">
                      {presentation.templateImage ? (
                        <img 
                          src={presentation.templateImage.startsWith('data:') ? presentation.templateImage : `data:image/png;base64,${presentation.templateImage}`}
                          alt={presentation.name}
                          className="template-preview"
                          onError={(e) => {
                            console.log('Image load error for presentation:', presentation.name, 'Image data:', presentation.templateImage?.substring(0, 50));
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully for presentation:', presentation.name);
                          }}
                        />
                      ) : null}
                      <div 
                        className="template-placeholder"
                        style={{ display: presentation.templateImage ? 'none' : 'flex' }}
                      >
                        <span>Sin imagen</span>
                      </div>
                    </div>
                    <div className="presentation-name">
                      {presentation.name}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
                  {loading ? 'Cargando presentaciones...' : 'No hay presentaciones disponibles'}
                </div>
              )}
            </div>
            {errors.presentations && <span className="error-message">{errors.presentations}</span>}
          </div>

          {/* Prompt Editor */}
          {selectedPresentations.length > 0 && (
            <div className="form-group">
              <label className="card-label">Editar Prompts</label>
              {selectedPresentations.map((presentationId) => {
                const presentation = presentations.find(p => p._id === presentationId);
                return (
                  <div key={presentationId} className="prompt-editor-group">
                    <label className="prompt-label">{presentation?.name}</label>
                    <textarea
                      value={presentationPrompts[presentationId] || presentation?.promptText || ''}
                      onChange={(e) => setPresentationPrompts(prev => ({
                        ...prev,
                        [presentationId]: e.target.value
                      }))}
                      className="prompt-textarea"
                      rows="4"
                      placeholder="Editar el prompt para esta presentación..."
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantities Input */}
          {selectedPresentations.length > 0 && (
            <div className="form-group">
              <label className="card-label">Cantidades</label>
              <p className="helper-text">
                Ingrese las cantidades separadas por comas. Cada cantidad generará una imagen separada.
                Ejemplo: "250ml, 500ml, 1L"
              </p>
              {selectedPresentations.map((presentationId) => {
                const presentation = presentations.find(p => p._id === presentationId);
                return (
                  <div key={presentationId} className="quantity-input-group">
                    <label className="quantity-label">{presentation?.name}</label>
                    <input
                      type="text"
                      value={presentationQuantities[presentationId] || ''}
                      onChange={(e) => setPresentationQuantities(prev => ({
                        ...prev,
                        [presentationId]: e.target.value
                      }))}
                      className="quantity-input"
                      placeholder="250ml, 500ml, 1L"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Generate Images Button */}
          {presentations && presentations.length > 0 && (
            <div className="form-group">
              <button 
                type="button" 
                className="generate-images-button"
                onClick={handleGenerateImages}
                disabled={isGeneratingImages || selectedPresentations.length === 0}
              >
                {isGeneratingImages ? 'Generando...' : 'Generar Imágenes'}
              </button>
              {selectedPresentations.length === 0 && (
                <p className="helper-text" style={{ marginTop: '10px', color: '#666' }}>
                  Seleccione al menos una presentación para generar imágenes
                </p>
              )}
              {errors.imageGeneration && (
                <span className="error-message">{errors.imageGeneration}</span>
              )}
              {errors.imageRegeneration && (
                <span className="error-message">{errors.imageRegeneration}</span>
              )}
            </div>
          )}

          {/* Generated Images Preview */}
          {Object.keys(generatedImages).length > 0 && (
            <div className="form-group">
              <label className="card-label">Imágenes Generadas</label>
              <div className="generated-images-grid">
                {Object.entries(generatedImages).map(([key, imageData]) => (
                  <div key={key} className="generated-image-card">
                    <img 
                      src={imageData.url} 
                      alt={imageData.presentationName}
                      className="generated-thumbnail"
                    />
                    <div className="image-info">
                      <span className="presentation-name">{imageData.presentationName}</span>
                      <span className="quantity">{imageData.quantity}</span>
                    </div>
                    <button 
                      className="regenerate-button"
                      onClick={() => handleRegenerateImage(key)}
                      disabled={isGeneratingImages}
                    >
                      Regenerar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8. Image Attachment Section (for generated images) */}
        {Object.keys(generatedImages).length > 0 && (
          <div className="form-group image-attachment-section">
            <h2 className="section-title">Adjuntar Imágenes Generadas</h2>
            <p className="helper-text">
              Seleccione las imágenes generadas que desea adjuntar al producto. 
              Puede seleccionar todas, algunas o ninguna.
            </p>
            <div className="attachment-images-grid">
              {Object.entries(generatedImages).map(([key, imageData]) => (
                <div key={key} className="attachment-image-card">
                  <div className="attachment-checkbox">
                    <input
                      type="checkbox"
                      id={`attach-${key}`}
                      checked={selectedGeneratedImages.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGeneratedImages(prev => [...prev, key]);
                        } else {
                          setSelectedGeneratedImages(prev => prev.filter(k => k !== key));
                        }
                      }}
                    />
                    <label htmlFor={`attach-${key}`} className="attachment-label">
                      <img 
                        src={imageData.url} 
                        alt={imageData.presentationName}
                        className="attachment-thumbnail"
                      />
                      <div className="attachment-info">
                        <span className="attachment-name">{imageData.presentationName}</span>
                        <span className="attachment-quantity">{imageData.quantity}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="attachment-actions">
              <button 
                type="button" 
                className="select-all-button"
                onClick={() => setSelectedGeneratedImages(Object.keys(generatedImages))}
              >
                Seleccionar Todas
              </button>
              <button 
                type="button" 
                className="deselect-all-button"
                onClick={() => setSelectedGeneratedImages([])}
              >
                Deseleccionar Todas
              </button>
            </div>
          </div>
        )}

        {/* 9. Create Product Button */}
        <div className="form-group">
          <button type="submit" className="submit-button">
            {submitButtonText}
          </button>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <div className="form-group">
            <span className="error-message">{errors.submit}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductForm;