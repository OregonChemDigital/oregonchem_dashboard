import React from 'react';
import PresentationForm from '../../components/Forms/PresentationForm';
import { useNavigate } from 'react-router-dom';

const CreatePresentation = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/presentations');
  };

  return (
    <div className="create-presentation-container">
      <h1>Crear Presentación</h1>
      <PresentationForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreatePresentation; 