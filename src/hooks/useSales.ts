import { useState } from 'react';
import { Sale } from '../types'; // Import Sale type
import { apiService } from '../services/api';

export const useSales = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSales = async (page: number = 1, limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      // Use the new sales-history endpoint
      const response = await apiService.getCashierSales(page, limit);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // NEW: Get all sales across all pages for cashier
  const getAllSales = async (): Promise<Sale[]> => {
    setLoading(true);
    setError(null);
    try {
      let allSales: Sale[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiService.getCashierSales(page, 100);
        
        if (response.data && response.data.length > 0) {
          allSales = [...allSales, ...response.data];
          hasMore = page < response.pagination.totalPages;
          page++;
        } else {
          hasMore = false;
        }
      }

      console.log(`✅ Loaded all ${allSales.length} cashier sales`);
      return allSales;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch all sales';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTodaySales = async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getCashierTodaySales();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch today sales';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSalesByDate = async (date: string): Promise<Sale[]> => {
    try {
      console.log('🔄 Using NEW endpoint for date:', date);
      
      // Use the new simple endpoint
      const sales = await apiService.getSalesByDate(date);
      console.log('✅ NEW endpoint found sales:', sales.length);
      return sales;
      
    } catch (error) {
      console.error('❌ NEW endpoint failed, using client-side filtering:', error);
      
      // Fallback to client-side filtering
      const allSales = await getAllSales();
      const filtered = allSales.filter(sale => {
        if (!sale.created_at) return false;
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
        return saleDate === date;
      });
      
      console.log('🔄 Client-side filtering found:', filtered.length, 'sales');
      return filtered;
    }
  };

  return {
    loading,
    error,
    getSales,
    getAllSales,  
    getTodaySales,
    getSalesByDate,
  };
};