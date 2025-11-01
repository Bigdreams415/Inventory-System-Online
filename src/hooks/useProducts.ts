import { useState, useEffect } from 'react';
import { Product } from '../types';

declare global {
  interface Window {
    electronAPI: {
      getProducts: () => Promise<Product[]>;
      createProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
      updateProduct: (product: Product) => Promise<void>;
      deleteProduct: (id: string) => Promise<void>;
      searchProducts: (searchTerm: string) => Promise<Product[]>;
    };
  }
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  const loadProducts = async () => {
    if (!isElectron) {
      setError('Application not running in Electron environment. Please use the desktop app.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.getProducts();
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products from database';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!isElectron) {
      throw new Error('Application not running in Electron environment');
    }

    setError(null);
    try {
      const newProduct = await window.electronAPI.createProduct(product);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product to database';
      setError(errorMessage);
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (product: Product) => {
    if (!isElectron) {
      throw new Error('Application not running in Electron environment');
    }

    setError(null);
    try {
      await window.electronAPI.updateProduct(product);
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product in database';
      setError(errorMessage);
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isElectron) {
      throw new Error('Application not running in Electron environment');
    }

    setError(null);
    try {
      await window.electronAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product from database';
      setError(errorMessage);
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const searchProducts = async (searchTerm: string): Promise<Product[]> => {
    if (!isElectron) {
      throw new Error('Application not running in Electron environment');
    }

    setError(null);
    try {
      return await window.electronAPI.searchProducts(searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search products in database';
      setError(errorMessage);
      console.error('Error searching products:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (isElectron) {
      loadProducts();
    }
  }, []);

  return {
    products,
    loading,
    error,
    isElectron,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts
  };
};