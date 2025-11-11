// MobileHeader.tsx
import React, { useState, useEffect } from 'react';

interface Pharmacy {
  id: string;
  name: string;
  location: string;
}

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  const [currentPharmacy, setCurrentPharmacy] = useState<Pharmacy | null>(null);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  useEffect(() => {
    fetchCurrentPharmacy();
  }, []);

  const fetchCurrentPharmacy = async () => {
    try {
      const response = await fetch('https://inventory-system-server-wx3t.onrender.com/api/pharmacy/current');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentPharmacy(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Hamburger Menu + Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center">
            <img
              src="/solo.png"
              alt="Solomon Medicals Logo"
              className="h-10 w-auto object-contain"
            />
            {/* <span className="ml-2 text-lg font-semibold text-gray-800">
              Solomon POS
            </span> */}
          </div>
        </div>

        {/* Right: Pharmacy Selector */}
        <button 
          onClick={() => setShowPharmacyModal(true)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
            <span className="text-white font-semibold text-xs">
              {currentPharmacy ? getInitials(currentPharmacy.name) : '?'}
            </span>
          </div>
        </button>
      </div>

      {/* Pharmacy Modal - Mobile Optimized */}
      {showPharmacyModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowPharmacyModal(false)}
          />
          
          <div className="relative bg-white rounded-t-2xl shadow-xl w-full max-h-[70vh] overflow-hidden z-10">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Current Pharmacy</h3>
                <button 
                  onClick={() => setShowPharmacyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {currentPharmacy ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-semibold text-lg">
                      {getInitials(currentPharmacy.name)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800">{currentPharmacy.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{currentPharmacy.location}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No pharmacy selected</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPharmacyModal(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;