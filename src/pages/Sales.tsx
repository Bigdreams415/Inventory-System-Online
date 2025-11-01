import React from 'react';

const Sales: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales History</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Sales records will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Sales;
