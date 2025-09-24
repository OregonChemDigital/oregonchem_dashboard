import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { fetchWithCache, API_ENDPOINTS } from '../../utils/api';
import AIProductForm from '../../components/Forms/AIProductForm';
import './CreateProduct.css';

const CreateAIProduct = () => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        showLoading();
        const categoriesData = await fetchWithCache(API_ENDPOINTS.CATEGORIES);
        setCategories(categoriesData?.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Error al cargar las categorías');
      } finally {
        hideLoading();
        setLoading(false);
      }
    };

    fetchCategories();
  }, [showLoading, hideLoading]);

  const handleSuccess = () => {
    // Redirect or show success message
    window.location.href = '/productos/todos';
  };

  if (loading) {
    return <div className="loading">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="create-product-container">
      <div className="page-header">
        <h1>Crear Producto con IA</h1>
        <p>Utiliza inteligencia artificial para generar imágenes y crear productos de manera más eficiente.</p>
      </div>
      
      <AIProductForm
        categories={categories}
        onSuccess={handleSuccess}
        submitButtonText="Crear Producto con IA"
      />
    </div>
  );
};

export default CreateAIProduct;