import React from 'react';
import BannerForm from '../../components/Forms/BannerForm';
import { useNavigate } from 'react-router-dom';

const CreateBanner = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/banners');
  };

  return (
    <div className="create-banner-container">
      <h1>Crear Banner</h1>
      <BannerForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateBanner; 