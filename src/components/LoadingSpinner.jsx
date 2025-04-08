import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 24, color = '#1e3c72' }) => {
  return (
    <div className="loading-spinner-container">
      <FaSpinner className="loading-spinner" style={{ fontSize: size, color }} />
    </div>
  );
};

export default LoadingSpinner; 