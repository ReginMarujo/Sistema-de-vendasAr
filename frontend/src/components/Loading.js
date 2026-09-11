import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="inline-block">
          <div className="border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin"></div>
        </div>
        <p className="text-gray-600 mt-4">Carregando...</p>
      </div>
    </div>
  );
};

export default Loading;
