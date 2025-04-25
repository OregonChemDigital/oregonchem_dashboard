import React from 'react';
import ProductForm from '../../components/Forms/ProductForm';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/products');
  };

  return (
    <div className="create-product-container">
      <h1>Crear Producto</h1>
      <ProductForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateProduct; 