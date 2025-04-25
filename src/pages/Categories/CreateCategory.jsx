import React from 'react';
import CategoryForm from '../../components/Forms/CategoryForm';
import { useNavigate } from 'react-router-dom';

const CreateCategory = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/categories');
  };

  return (
    <div className="create-category-container">
      <h1>Crear Categoría</h1>
      <CategoryForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateCategory; 