import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type] || 'bg-blue-500';

  return (
    <div className={`${bgColor} text-white px-6 py-4 rounded shadow-lg fixed top-4 right-4 z-50 animate-bounce`}>
      {message}
    </div>
  );
};

export default Toast;
