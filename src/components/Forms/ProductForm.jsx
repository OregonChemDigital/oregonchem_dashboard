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

        {/* Presentations Selection */}
        <div className="form-group">
          <label className="card-label">Presentaciones</label>
          <div className="presentations-body">
            {presentations && presentations.map((presentation) => (
              <div key={presentation._id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`presentation-${presentation._id}`}
                  name="presentations"
                  value={presentation._id}
                  checked={selectedPresentations.includes(presentation._id)}
                  onChange={() =>
                    toggleSelection(
                      selectedPresentations,
                      setSelectedPresentations,
                      presentation._id
                    )
                  }
                />
                <label htmlFor={`presentation-${presentation._id}`}>
                  {presentation.name}
                </label>
              </div>
            ))}
          </div>
          {errors.presentations && <span className="error-message">{errors.presentations}</span>}
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

        {/* Dynamic Fields for Selected Frontends */}
        {selectedFrontends.map((frontend) => {
          const frontendOption = FRONTEND_OPTIONS.find(f => f.id === frontend);
          const imageForSite = productImages.find(img => img.site === frontend);
          
          return (
            <div key={frontend} className="frontend-section">
              <h3 className="frontend-section-title">{frontendOption?.label}</h3>
              
              {/* Description */}
              <div className="form-group">
                <label className="card-label">Descripción</label>
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

              {/* Uses */}
              <div className="form-group">
                <label className="card-label">Usos</label>
                <p className="helper-text">
                  Ingrese los usos separados por comas. Estos se utilizarán como palabras clave para SEO.
                  Ejemplo: "limpieza industrial, desinfección, sanitización, limpieza de superficies"
                </p>
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

              {/* Price */}
              <div className="form-group">
                <label className="card-label">Precio</label>
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

              {/* Image */}
              <div className="form-group">
                <label className="card-label">Imagen</label>
                <div className="image-container">
                  <div className="image-circle">
                    <label
                      htmlFor={`product-image-${frontend}`}
                      className="image-upload-label"
                    >
                      {imageForSite?.previewUrl ? (
                        <img
                          src={imageForSite.previewUrl}
                          alt={`Product ${frontendOption?.label}`}
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
                </div>
                {errors[`image${frontend}`] && (
                  <span className="error-message">{errors[`image${frontend}`]}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
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