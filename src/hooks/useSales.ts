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
    setLoading(true);
    setError(null);
    try {
      // Use the same date for start and end to get sales for a specific day
      const salesData = await apiService.getSalesByDateRange(date, date);
      return salesData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales by date';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
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