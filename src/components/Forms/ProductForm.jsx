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
  const [filteredPresentations, setFilteredPresentations] = useState([]);
  const [selectedPresentations, setSelectedPresentations] = useState(initialData?.presentations || []);
  const [presentationType, setPresentationType] = useState("solido");
  const [selectedCategories, setSelectedCategories] = useState(initialData?.categories || []);
  const [selectedFrontends, setSelectedFrontends] = useState(initialData?.frontends || ['site1']);
  const [descriptions, setDescriptions] = useState(initialData?.descriptions ? Object.values(initialData.descriptions) : Array(5).fill(""));
  const [uses, setUses] = useState(initialData?.uses ? Object.values(initialData.uses) : Array(5).fill(""));
  const [productImages, setProductImages] = useState(
    initialData?.images ? Object.entries(initialData.images).map(([_, url]) => ({ file: null, previewUrl: url })) : Array(5).fill({ file: null, previewUrl: null })
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

  useEffect(() => {
    if (presentations) {
      setFilteredPresentations(
        presentations.filter((presentation) => presentation.type === presentationType)
      );
    }
  }, [presentationType, presentations]);

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ images: "Please upload an image file" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProductImages((prev) => {
      const updated = [...prev];
      updated[index] = { file, previewUrl };
      return updated;
    });
  };

  const toggleSelection = (array, setArray, itemId) => {
    setArray((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleArrayChange = (array, setArray, index, value) => {
    setArray((prev) => {
      const updatedArray = [...prev];
      updatedArray[index] = value;
      return updatedArray;
    });
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
    
    // Only validate descriptions, uses, and images for selected frontends
    selectedFrontends.forEach((frontend, index) => {
      const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
      if (!descriptions[frontendIndex]?.trim()) {
        newErrors[`description${frontendIndex}`] = `Description for ${FRONTEND_OPTIONS[frontendIndex].label} is required`;
      }
      if (!uses[frontendIndex]?.trim()) {
        newErrors[`use${frontendIndex}`] = `Use for ${FRONTEND_OPTIONS[frontendIndex].label} is required`;
      }
      if (!productImages[frontendIndex]?.file && !productImages[frontendIndex]?.previewUrl) {
        newErrors[`image${frontendIndex}`] = `Image for ${FRONTEND_OPTIONS[frontendIndex].label} is required`;
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
      selectedFrontends.forEach((frontend, index) => {
        const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
        formData.append(`descriptions[${frontend}]`, descriptions[frontendIndex]);
        formData.append(`uses[${frontend}]`, uses[frontendIndex]);
        if (productImages[frontendIndex]?.file) {
          formData.append(`images[${frontend}]`, productImages[frontendIndex].file);
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
      setProductImages(Array(5).fill({ file: null, previewUrl: null }));
      setDescriptions(Array(5).fill(""));
      setUses(Array(5).fill(""));
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
        <div className="form-group">
          <label htmlFor="product-name" className="card-label">
            Nombre
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Ingresar nombre"
            className="input-field"
            defaultValue={initialData?.name}
          />
          {errors.productName && <span className="error-message">{errors.productName}</span>}
        </div>

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

        <div className="form-group">
          <label className="card-label">Presentaciones</label>
          <select
            id="presentationType"
            value={presentationType}
            onChange={(e) => setPresentationType(e.target.value)}
            required
            className="input-field"
          >
            <option value="solido">Sólidas</option>
            <option value="liquido">Líquidas</option>
          </select>
          <div className="presentations-body">
            {filteredPresentations.map((presentation) => (
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
        <div className="form-group">
          <label className="card-label">Descripciones</label>
          {selectedFrontends.map((frontend, index) => {
            const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
            return (
              <div key={frontend} className="frontend-input-group">
                <label className="frontend-label">{FRONTEND_OPTIONS[frontendIndex].label}</label>
                <input
                  id={`description-${frontendIndex + 1}`}
                  value={descriptions[frontendIndex] || ""}
                  onChange={(e) =>
                    handleArrayChange(descriptions, setDescriptions, frontendIndex, e.target.value)
                  }
                  placeholder={`Descripción ${FRONTEND_OPTIONS[frontendIndex].label}`}
                  className="input-field"
                />
                {errors[`description${frontendIndex}`] && (
                  <span className="error-message">{errors[`description${frontendIndex}`]}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="form-group">
          <label className="card-label">Usos</label>
          <p className="helper-text">
            Ingrese los usos separados por comas. Estos se utilizarán como palabras clave para SEO.
            Ejemplo: "limpieza industrial, desinfección, sanitización, limpieza de superficies"
          </p>
          {selectedFrontends.map((frontend, index) => {
            const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
            return (
              <div key={frontend} className="frontend-input-group">
                <label className="frontend-label">{FRONTEND_OPTIONS[frontendIndex].label}</label>
                <input
                  id={`use-${frontendIndex + 1}`}
                  value={uses[frontendIndex] || ""}
                  onChange={(e) =>
                    handleArrayChange(uses, setUses, frontendIndex, e.target.value)
                  }
                  placeholder={`Usos para ${FRONTEND_OPTIONS[frontendIndex].label} (separados por comas)`}
                  className="input-field"
                />
                {errors[`use${frontendIndex}`] && (
                  <span className="error-message">{errors[`use${frontendIndex}`]}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="form-group">
          <label className="card-label">Imágenes</label>
          <div className="image-container">
            {selectedFrontends.map((frontend, index) => {
              const frontendIndex = parseInt(frontend.replace('site', '')) - 1;
              return (
                <div key={frontend} className="frontend-image-group">
                  <label className="frontend-label">{FRONTEND_OPTIONS[frontendIndex].label}</label>
                  <div className="image-circle">
                    <label
                      htmlFor={`product-image-${frontendIndex}`}
                      className="image-upload-label"
                    >
                      {productImages[frontendIndex]?.previewUrl ? (
                        <img
                          src={productImages[frontendIndex].previewUrl}
                          alt={`Product ${FRONTEND_OPTIONS[frontendIndex].label}`}
                          className="image-preview"
                        />
                      ) : (
                        <span className="plus-sign">+</span>
                      )}
                    </label>
                    <input
                      type="file"
                      id={`product-image-${frontendIndex}`}
                      className="image-upload-input"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(event, frontendIndex)}
                    />
                  </div>
                  {errors[`image${frontendIndex}`] && (
                    <span className="error-message">{errors[`image${frontendIndex}`]}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="form-group">
          <button type="submit" className="submit-button">
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;