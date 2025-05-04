import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 40, color = '#1e3c72' }) => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        <FaSpinner className="loading-spinner" style={{ fontSize: size, color }} />
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 