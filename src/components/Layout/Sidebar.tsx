import React from 'react';
import { PageType } from '../../types/navigation';

interface SidebarProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: '📊' },
    { id: 'pos' as PageType, label: 'Point of Sale', icon: '💳' },
    { id: 'inventory' as PageType, label: 'Inventory', icon: '📦' },
    { id: 'sales' as PageType, label: 'Sales History', icon: '💰' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white h-full">
      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
