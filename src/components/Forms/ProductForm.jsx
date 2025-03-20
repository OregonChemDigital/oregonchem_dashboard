import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/authContext';
import "./Forms.css";

const ProductForm = () => {
  const { currentUser } = useAuth();
  const [presentations, setPresentations] = useState([]);
  const [filteredPresentations, setFilteredPresentations] = useState([]);
  const [selectedPresentations, setSelectedPresentations] = useState([]);
  const [presentationType, setPresentationType] = useState("solido");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [descriptions, setDescriptions] = useState(Array(5).fill(""));
  const [uses, setUses] = useState(Array(5).fill(""));
  const [productImages, setProductImages] = useState(
    Array(5).fill({ file: null, previewUrl: null })
  );
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [presentationsRes, categoriesRes] = await Promise.all([
          fetch("https://oregonchem-backend.onrender.com/api/public/presentaciones"),
          fetch("https://oregonchem-backend.onrender.com/api/public/categorias"),
        ]);
        setPresentations(await presentationsRes.json());
        setCategories(await categoriesRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredPresentations(
      presentations.filter((presentation) => presentation.type === presentationType)
    );
  }, [presentationType, presentations]);

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProductImages((prev) => {
        const updated = [...prev];
        updated[index] = { file, previewUrl };
        return updated;
      });
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    const productName = document.getElementById("product-name").value;

    // Validation checks
    if (!productName) newErrors.productName = "Product name is required";
    if (selectedPresentations.length === 0) newErrors.presentations = "At least one presentation must be selected";
    if (selectedCategories.length === 0) newErrors.categories = "At least one category must be selected";

    descriptions.forEach((description, index) => {
      if (!description) newErrors[`description${index}`] = `Description ${index + 1} is required`;
    });

    uses.forEach((use, index) => {
      if (!use) newErrors[`use${index}`] = `Use ${index + 1} is required`;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (!currentUser) {
        setMessage("You need to be logged in to submit a product.");
        return;
      }

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append("name", productName);
      selectedPresentations.forEach(p => formData.append("presentations[]", p));
      selectedCategories.forEach(c => formData.append("categories[]", c));

      // Append descriptions and uses
      descriptions.forEach((desc, index) => {
        formData.append(`descriptions[site${index + 1}]`, desc);
      });

      uses.forEach((use, index) => {
        formData.append(`uses[site${index + 1}]`, use);
      });

      // Append images
      productImages.forEach((imageObj, index) => {
        if (imageObj.file) {
          formData.append(`images[site${index + 1}]`, imageObj.file); // Ensure this matches the keys expected by multer
        }
      });

      // Optional: Log the form data entries for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("https://oregonchem-backend.onrender.com/api/productos/nuevo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const textResponse = await response.text();
        console.error("Error response:", textResponse);
        throw new Error(`Server error: ${textResponse}`);
      }

      const result = await response.json();

      // Reset the form on successful submission
      setProductImages(Array(5).fill({ file: null, previewUrl: null }));
      setDescriptions(Array(5).fill(""));
      setUses(Array(5).fill(""));
      setSelectedPresentations([]);
      setSelectedCategories([]);
      setErrors({});
      setMessage("Product added successfully!");
    } catch (error) {
      console.error("Error submitting form", error);
      setMessage(`Error adding product: ${error.message}`);
    }
  };


  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product-name" className="card-label">
            Nombre
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Ingresar nombre"
            className="input-field"
          />
          {errors.productName && <span className="error-message">{errors.productName}</span>}
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
                  {presentation.name} ({presentation.quantity} {presentation.measure})
                </label>
              </div>
            ))}
          </div>
          {errors.presentations && <span className="error-message">{errors.presentations}</span>}
        </div>
        <div className="form-group">
          <label className="card-label">Categorías</label>
          <div className="categories-body">
            {categories.map((category) => (
              <div key={category._id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`category-${category._id}`}
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
          {descriptions.map((description, index) => (
            <textarea
              key={index}
              value={description}
              onChange={(e) =>
                handleArrayChange(
                  descriptions,
                  setDescriptions,
                  index,
                  e.target.value
                )
              }
              placeholder={`Descripción ${index + 1}`}
              className="textarea-field"
            />
          ))}
          {descriptions.map((_, index) =>
            errors[`description${index}`] && (
              <span key={index} className="error-message">{errors[`description${index}`]}</span>
            )
          )}
        </div>
        <div className="form-group">
          <label className="card-label">Usos</label>
          {uses.map((use, index) => (
            <input
              key={index}
              value={use}
              onChange={(e) =>
                handleArrayChange(uses, setUses, index, e.target.value)
              }
              placeholder={`Uso ${index + 1}`}
              className="input-field"
            />
          ))}
          {uses.map((_, index) =>
            errors[`use${index}`] && (
              <span key={index} className="error-message">{errors[`use${index}`]}</span>
            )
          )}
        </div>
        <div className="form-group">
          <label className="card-label">Imágenes</label>
          <div className="image-container">
            {productImages.map((imageObj, index) => (
              <div key={index} className="image-circle">
                <label
                  htmlFor={`product-image-${index}`}
                  className="image-upload-label"
                >
                  {imageObj.previewUrl ? (
                    <img
                      src={imageObj.previewUrl}
                      alt={`Product ${index + 1}`}
                      className="image-preview"
                    />
                  ) : (
                    <span className="plus-sign">+</span>
                  )}
                </label>
                <input
                  type="file"
                  id={`product-image-${index}`}
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
            Añadir producto
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
  );
};

export default ProductForm;