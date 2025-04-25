import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import ProductForm from './ProductForm';
import "./Forms.css";

const UpdateProductForm = ({ product, onSuccess, isQuimicaIndustrial = false }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (product) {
      const initialData = {
        name: product.name,
        presentations: product.presentations.map(p => p._id),
        categories: product.categories.map(c => c._id),
        descriptions: product.descriptions || {},
        uses: product.uses || {},
        images: product.images || {}
      };

      if (isQuimicaIndustrial) {
        // For Quimica Industrial, only show site1 data
        initialData.descriptions = { site1: product.descriptions?.site1 || "" };
        initialData.uses = { site1: product.uses?.site1 || "" };
        initialData.images = { site1: product.images?.site1 || "" };
      }

      setFormData(initialData);
    }
  }, [product, isQuimicaIndustrial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      showLoading();
      
      if (!currentUser) {
        throw new Error("You need to be logged in to update a product.");
      }

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      const productName = document.getElementById("product-name").value;
      formData.append("name", productName);
      
      const selectedPresentations = Array.from(document.querySelectorAll('input[name="presentations"]:checked'))
        .map(input => input.value);
      selectedPresentations.forEach(p => formData.append("presentations[]", p));
      
      const selectedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
        .map(input => input.value);
      selectedCategories.forEach(c => formData.append("categories[]", c));

      const descriptions = {};
      const uses = {};
      
      if (isQuimicaIndustrial) {
        // For Quimica Industrial, only update site1
        const descInput = document.getElementById('description-1');
        const useInput = document.getElementById('use-1');
        if (descInput) descriptions.site1 = descInput.value;
        if (useInput) uses.site1 = useInput.value;
      } else {
        // For all products, update all sites
        for (let i = 1; i <= 5; i++) {
          const descInput = document.getElementById(`description-${i}`);
          const useInput = document.getElementById(`use-${i}`);
          if (descInput) descriptions[`site${i}`] = descInput.value;
          if (useInput) uses[`site${i}`] = useInput.value;
        }
      }

      formData.append("descriptions", JSON.stringify(descriptions));
      formData.append("uses", JSON.stringify(uses));

      const response = await fetch(`http://localhost:5001/api/productos/${product._id}`, {
        method: "PUT",
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
      showSuccess("Producto actualizado exitosamente");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      hideLoading();
      setShowConfirmation(false);
    }
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="form-container">
      {showConfirmation ? (
        <div className="confirmation-dialog">
          <h3>¿Estás seguro/a de que desea actualizar este producto?</h3>
          <div className="confirmation-buttons">
            <button onClick={handleSubmit} className="confirm-button">
              Sí, actualizar
            </button>
            <button onClick={() => setShowConfirmation(false)} className="cancel-button">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <ProductForm
          initialData={formData}
          onSubmit={handleSubmit}
          submitButtonText="Actualizar producto"
          isQuimicaIndustrial={isQuimicaIndustrial}
        />
      )}
    </div>
  );
};

export default UpdateProductForm; 