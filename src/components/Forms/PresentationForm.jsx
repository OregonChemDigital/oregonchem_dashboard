import React, { useState } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import "./Forms.css";

const MEASUREMENT_OPTIONS = {
  solido: [
    { value: "g", label: "Gramos (g)" },
    { value: "kg", label: "Kilogramos (kg)" }
  ],
  liquido: [
    { value: "ml", label: "Mililitros (ml)" },
    { value: "L", label: "Litros (L)" },
    { value: "gal", label: "Galones (gal)" }
  ]
};

const PresentationForm = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [type, setType] = useState("solido");
  const [measure, setMeasure] = useState("g");
  const [quantity, setQuantity] = useState("");
  const [presentationImages, setPresentationImages] = useState(Array(5).fill({ file: null, previewUrl: null }));
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setType("solido");
    setMeasure("g");
    setQuantity("");
    setPresentationImages(Array(5).fill({ file: null, previewUrl: null }));
    setErrors({});
  };

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ images: "Por favor suba un archivo de imagen" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPresentationImages(prev => {
      const updated = [...prev];
      updated[index] = { file, previewUrl };
      return updated;
    });
  };

  const renderMeasurementOptions = () => MEASUREMENT_OPTIONS[type].map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setType(newType);
    setMeasure(MEASUREMENT_OPTIONS[newType][0].value);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!quantity.trim()) {
      newErrors.quantity = "Cantidad es requerida";
    } else if (isNaN(quantity) || parseFloat(quantity) <= 0) {
      newErrors.quantity = "La cantidad debe ser un número positivo";
    }
    
    if (!presentationImages.some(img => img.file)) {
      newErrors.images = "Por favor suba al menos una imagen";
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
      const formData = new FormData();
      
      formData.append("name", `${quantity} ${measure}`);
      formData.append("type", type);
      formData.append("measure", measure);
      formData.append("quantity", quantity);
      
      presentationImages.forEach((image, index) => {
        if (image.file) {
          formData.append(`images[site${index + 1}]`, image.file);
        }
      });

      const response = await fetch("http://localhost:5001/api/presentaciones/nueva", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
        <label htmlFor="type" className="card-label">
          Tipo de presentación:
        </label>
        <select
          id="type"
          value={type}
          onChange={handleTypeChange}
          className={`input-field ${errors.type ? "error" : ""}`}
        >
          <option value="solido">Sólido</option>
          <option value="liquido">Líquido</option>
        </select>
        {errors.type && <span className="error-message">{errors.type}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="measure" className="card-label">
          Medida:
        </label>
        <select
          id="measure"
          value={measure}
          onChange={(e) => setMeasure(e.target.value)}
          className={`input-field ${errors.measure ? "error" : ""}`}
        >
          {renderMeasurementOptions()}
        </select>
        {errors.measure && <span className="error-message">{errors.measure}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="quantity" className="card-label">
          Cantidad:
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={`input-field ${errors.quantity ? "error" : ""}`}
          placeholder="Introduzca la cantidad"
          min="0"
          step="any"
        />
        {errors.quantity && <span className="error-message">{errors.quantity}</span>}
      </div>

      <div className="form-group">
        <label className="card-label">Imágenes</label>
        <div className="image-container">
          {presentationImages.map((image, index) => (
            <div key={index} className="image-circle">
              <label htmlFor={`presentation-image-${index}`} className="image-upload-label">
                {image.previewUrl ? (
                  <img
                    src={image.previewUrl}
                    alt={`Presentation ${index + 1}`}
                    className="image-preview"
                  />
                ) : (
                  <span className="plus-sign">+</span>
                )}
              </label>
              <input
                type="file"
                id={`presentation-image-${index}`}
                className="image-upload-input"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, index)}
              />
            </div>
          ))}
        </div>
        {errors.images && <span className="error-message">{errors.images}</span>}
      </div>

      <div className="form-group">
        <button type="submit" className="submit-button">
          Añadir presentación
        </button>
      </div>
    </form>
  );
};

export default PresentationForm;