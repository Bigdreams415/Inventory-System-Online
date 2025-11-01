import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import PointOfSale from './pages/PointOfSale';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import { PageType } from './types/navigation';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('pos');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <PointOfSale />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      default:
        return <PointOfSale />;
    }
  };

  return (
    <Layout activePage={currentPage} setActivePage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
