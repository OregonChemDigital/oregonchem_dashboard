import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import "./Forms.css";

const UpdateBannerForm = ({ banner, onUpdate, onClose }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [name, setName] = useState(banner?.name || "");
  const [site, setSite] = useState(banner?.site || "site1");
  const [bannerImage, setBannerImage] = useState({ 
    file: null, 
    previewUrl: banner?.imageUrl || null 
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (bannerImage.previewUrl && bannerImage.previewUrl !== banner?.imageUrl) {
        URL.revokeObjectURL(bannerImage.previewUrl);
      }
    };
  }, [bannerImage.previewUrl, banner?.imageUrl]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setBannerImage({ file, previewUrl });
    }
  };

  const handleImageClick = () => {
    document.getElementById('banner-image-upload').click();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    if (!site) {
      newErrors.site = "El sitio es requerido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    showLoading();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('site', site);
      if (bannerImage.file) {
        formData.append('image', bannerImage.file);
      }

      const response = await fetch(`http://localhost:5001/api/public/banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el banner');
      }

      const updatedBanner = await response.json();
      onUpdate(updatedBanner);
      showSuccess("Banner actualizado exitosamente");
      onClose();
    } catch (error) {
      console.error('Error updating banner:', error);
      setErrors({ submit: error.message });
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="form-container">
      <h2>Actualizar Banner</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="site">Sitio</label>
          <select
            id="site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className={errors.site ? 'error' : ''}
          >
            <option value="site1">Sitio 1</option>
            <option value="site2">Sitio 2</option>
            <option value="site3">Sitio 3</option>
          </select>
          {errors.site && <span className="error-message">{errors.site}</span>}
        </div>

        <div className="form-group">
          <label>Imagen del Banner</label>
          <div className="image-upload-container" onClick={handleImageClick}>
            {bannerImage.previewUrl ? (
              <img src={bannerImage.previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <div className="upload-placeholder">
                <span>Haz clic para seleccionar una imagen</span>
              </div>
            )}
            <input
              type="file"
              id="banner-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancelar
          </button>
          <button type="submit" className="submit-button">
            Actualizar Banner
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBannerForm; 