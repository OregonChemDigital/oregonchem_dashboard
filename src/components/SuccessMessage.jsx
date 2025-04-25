import React, { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './SuccessMessage.css';

const SuccessMessage = ({ message, onClose, duration = 3000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);
    }, 10);

    const timer = setTimeout(() => {
      clearInterval(interval);
      onClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  return (
    <div className="success-message-container">
      <div className="success-message">
        <div className="success-content">
          <FaCheckCircle className="success-icon" />
          <span>{message}</span>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage; 