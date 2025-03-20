import React, { useState } from "react";
import { useAuth } from '../../contexts/authContext';

const CategoryForm = ({ onCategoryAdded, onClose }) => {
  const { currentUser } = useAuth();
  const [categoryName, setCategoryName] = useState("");
  const [categoryImages, setCategoryImages] = useState(
    Array(5).fill({ file: null, previewUrl: null })
  );
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const updatedImages = [...categoryImages];
      updatedImages[index] = { file, previewUrl };
      setCategoryImages(updatedImages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", categoryName);

    try {
      if (!currentUser) {
        setMessage("You need to be logged in to submit a category.");
        return;
      }

      // Get the ID token from the currentUser   
      const token = await currentUser.getIdToken();

      // Append images to formData with the correct keys
      categoryImages.forEach((imageObj, index) => {
        if (imageObj.file) {
          formData.append(`images[site${index + 1}]`, imageObj.file); // Corrected to match backend expectations
        }
      });

      const response = await fetch("https://oregonchem-backend.onrender.com/api/categorias/nueva", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the request headers
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating category:", errorData);
        setMessage(`Error: ${errorData.message}`);
        setMessageType("error");
        return;
      }

      setMessage("Category added successfully!");
      setMessageType("success");

      if (onCategoryAdded) onCategoryAdded();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting category", error);
      setMessage("There was an error submitting the category. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category-name" className="card-label">
              Nombre de Categoría
            </label>
            <input
              type="text"
              id="category-name"
              className="input-field"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Introduzca nombre de la nueva categoría"
              required
            />
          </div>

          <div className="form-group">
            <label className="card-label">Imágenes</label>
            <div className="image-container">
              {categoryImages.map((imageObj, index) => (
                <div key={index} className="image-circle">
                  <label htmlFor={`category-image-${index}`}>
                    {imageObj.previewUrl ? (
                      <img
                        src={imageObj.previewUrl}
                        alt={`Category ${index + 1}`}
                        className="image-preview"
                      />
                    ) : (
                      <span className="plus-sign">+</span>
                    )}
                  </label>
                  <input
                    type="file"
                    id={`category-image-${index}`}
                    className="image-upload-input"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event, index)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <button type="submit" className="submit-button">
              Añadir categoría
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

export default CategoryForm;