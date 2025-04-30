import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { API_ENDPOINTS } from '../../utils/api';
import "./Forms.css";

const BannerForm = () => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [name, setName] = useState("");
  const [site, setSite] = useState("site1");
  const [bannerImage, setBannerImage] = useState({ file: null, previewUrl: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (bannerImage.previewUrl) {
        URL.revokeObjectURL(bannerImage.previewUrl);
      }
    };
  }, [bannerImage.previewUrl]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ image: "Please upload an image file" });
      return;
    }

    if (bannerImage.previewUrl) {
      URL.revokeObjectURL(bannerImage.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setBannerImage({ file, previewUrl });
  };

  const handleImageClick = () => {
    document.getElementById("bannerImageInput").click();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Banner name is required";
    }
    
    if (!bannerImage.file) {
      newErrors.image = "Please upload a banner image";
    }

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
        throw new Error("You need to be logged in to submit a banner.");
      }

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      
      formData.append("name", name);
      formData.append("site", site);
      formData.append("image", bannerImage.file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}${API_ENDPOINTS.NEW_BANNER}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create banner');
      }

      showSuccess("Banner created successfully!");
      
      // Reset form
      setName("");
      setBannerImage({ file: null, previewUrl: null });
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
          Título:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`input-field ${errors.name ? "error" : ""}`}
          placeholder="Introduzca el título del banner"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="site" className="card-label">
          Para la web:
        </label>
        <select
          id="site"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className={`input-field ${errors.site ? "error" : ""}`}
        >
          <option value="site1">Química Industrial</option>
          <option value="site2">Web 2</option>
          <option value="site3">Web 3</option>
          <option value="site4">Web 4</option>
          <option value="site5">Web 5</option>
        </select>
        {errors.site && <span className="error-message">{errors.site}</span>}
      </div>

      <div className="form-group">
        <label className="card-label">Imágen</label>
        <div className="image-container">
          <div className="image-circle" onClick={handleImageClick}>
            <label className="image-upload-label">
              {bannerImage.previewUrl ? (
                <img
                  src={bannerImage.previewUrl}
                  className="image-preview"
                  alt="preview"
                />
              ) : (
                <span className="plus-sign">+</span>
              )}
            </label>
            <input
              type="file"
              id="bannerImageInput"
              className="image-upload-input"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>
        {errors.image && <span className="error-message">{errors.image}</span>}
      </div>

      <div className="form-group">
        <button type="submit" className="submit-button">
          Añadir banner
        </button>
      </div>
    </form>
  );
};

export default BannerForm;