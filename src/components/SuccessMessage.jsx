import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './SuccessMessage.css';

const SuccessMessage = ({ message, onClose, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="success-message-container">
      <div className="success-message">
        <FaCheckCircle className="success-icon" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default SuccessMessage; 