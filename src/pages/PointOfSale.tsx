import React from 'react';

const PointOfSale: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Point of Sale</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Products</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Products will go here */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">Products will appear here</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Cart</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Cart items will appear here</p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>$0.00</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Process Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
