import React, { useState, useEffect } from "react";

const BannerForm = () => {
  const [name, setName] = useState("");
  const [site, setSite] = useState("site1");
  const [bannerImage, setBannerImage] = useState({
    file: null,
    previewUrl: null,
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    return () => {
      if (bannerImage.previewUrl) {
        URL.revokeObjectURL(bannerImage.previewUrl);
      }
    };
  }, [bannerImage.previewUrl]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setBannerImage({ file, previewUrl });
    }
  };

  const handleImageClick = () => {
    document.getElementById("bannerImageInput").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("site", site);
    formData.append("image", bannerImage.file);

    try {
      const response = await fetch("http://localhost:3000/banners/nuevo", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating banner");
      }
      const data = await response.json();
      setMessageType("success");
      setMessage(data.message);
    } catch (error) {
      setMessageType("error");
      setMessage("Error creating banner");
    }
  };

  return (
    <>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="card-label">
              Título:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input-field"
              placeholder="Introduzca el título del banner"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="site" className="card-label">
              Para la web:
            </label>
            <select
              id="site"
              value={site}
              onChange={(event) => setSite(event.target.value)}
              required
              className="input-field"
            >
              <option value="site1">Química Industrial</option>
              <option value="site2">Web 2</option>
              <option value="site3">Web 3</option>
              <option value="site4">Web 4</option>
              <option value="site5">Web 5</option>
            </select>
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
          </div>
          <div className="form-group">
            <button type="submit" className="submit-button">
              Añadir banner
            </button>
          </div>

          {message && (
            <p
              className={
                messageType === "success" ? "success-message" : "error-message"
              }
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </>
  );
};

export default BannerForm;