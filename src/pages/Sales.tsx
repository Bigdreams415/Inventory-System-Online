// src/components/Sales.tsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;               // unique identifier (timestamp-based for demo)
  date: Date;               // when the sale was completed
  items: CartItem[];        // snapshot of the cart at checkout
  total: number;            // pre-calculated total
}

// ---------------------------------------------------------------------
// Helper: load / save sales to localStorage (replace with DB later)
// ---------------------------------------------------------------------
const STORAGE_KEY = 'pos_sales';

const loadSales = (): Sale[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw, (key, value) => {
    if (key === 'date') return new Date(value);
    return value;
  });
};

const saveSales = (sales: Sale[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

// ---------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------
const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(loadSales);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // -----------------------------------------------------------------
  // Keep localStorage in sync whenever sales change
  // -----------------------------------------------------------------
  useEffect(() => {
    saveSales(sales);
  }, [sales]);

  // -----------------------------------------------------------------
  // Listen for new sales broadcasted from PointOfSale (via custom event)
  // -----------------------------------------------------------------
  useEffect(() => {
    const handler = (e: CustomEvent<Sale>) => {
      setSales((prev) => [...prev, e.detail]);
    };

    window.addEventListener('newSale', handler as EventListener);
    return () => window.removeEventListener('newSale', handler as EventListener);
  }, []);

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales History</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {sales.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">No sales recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(sale.date, 'PPP p')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.items.reduce((sum, i) => sum + i.quantity, 0)} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          Detail Modal
        ------------------------------------------------------------- */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                Sale #{selectedSale.id.slice(-6)} – {format(selectedSale.date, 'PPP p')}
              </h3>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedSale.items.map((item) => (
                  <tr key={item.product.id}>
                    <td className="px-4 py-2 text-sm">{item.product.name}</td>
                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm">${item.product.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t pt-4 flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${selectedSale.total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setSelectedSale(null)}
              className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;