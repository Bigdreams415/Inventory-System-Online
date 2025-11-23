// Sidebar.tsx - MOBILE OPTIMIZED
import React from 'react';
import { PageType } from '../../types/navigation';

interface SidebarProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  onMobileItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onMobileItemClick }) => {
  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: '📊' },
    { id: 'pos' as PageType, label: 'Point of Sale', icon: '💳' },
    { id: 'inventory' as PageType, label: 'Inventory', icon: '📦' },
    { id: 'SalesHistory' as PageType, label: 'Sales History', icon: '🛒' },
    { id: 'Ledger' as PageType, label: 'Ledger', icon: '💰' },
    { id: 'services' as PageType, label: 'Services', icon: '🛠️' },
    { id: 'admin' as PageType, label: 'Admin', icon: '🔒' },
    { id: 'account' as PageType, label: 'Account', icon: '👤' },
    { id: 'settings' as PageType, label: 'Settings', icon: '⚙️' },
  ];

  const handleItemClick = (page: PageType) => {
    setActivePage(page);
    if (onMobileItemClick) {
      onMobileItemClick();
    }
  };

  return (
    <aside className="w-64 bg-gray-800 text-white h-full flex flex-col">
      {/* Close Button - Mobile Only */}
      <div className="lg:hidden p-4 border-b border-gray-700 flex justify-end">
        <button
          onClick={onMobileItemClick}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* App Info - Bottom */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-center text-gray-400 text-sm">
          <p>Solomon Medicals POS</p>
          <p className="text-xs mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;