import { useState, useCallback } from 'react'; // Add useCallback
import { Sale, CreateSaleRequest } from '../types';
import { apiService } from '../services/api';

export const useSales = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allSales, setAllSales] = useState<Sale[]>([]); // Add state to store all sales

  const createSale = async (saleData: CreateSaleRequest): Promise<Sale> => {
    setLoading(true);
    setError(null);
    try {
      const sale = await apiService.createSale(saleData);
      return sale;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process sale';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSales = async (page: number = 1, limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      return await apiService.getSales(page, limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // NEW: Get all sales across all pages
  const getAllSales = async (): Promise<Sale[]> => {
    setLoading(true);
    setError(null);
    try {
      let sales: Sale[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiService.getSales(page, 100);
        
        if (response.data && response.data.length > 0) {
          sales = [...sales, ...response.data];
          hasMore = page < response.pagination.totalPages;
          page++;
        } else {
          hasMore = false;
        }
      }

      console.log(`Loaded all ${sales.length} sales`);
      setAllSales(sales); // Store in state
      return sales;
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
      return await apiService.getTodaySales();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch today sales';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Use useCallback to prevent recreation
  const getSalesByDate = useCallback(async (date: string): Promise<Sale[]> => {
    try {
      console.log('🔄 Using NEW endpoint for date:', date);
      
      // Use the new simple endpoint
      const sales = await apiService.getSalesByDate(date);
      console.log('✅ NEW endpoint found sales:', sales.length);
      return sales;
      
    } catch (error) {
      console.error('❌ NEW endpoint failed, using client-side filtering:', error);
      
      // Use the already loaded sales instead of calling getAllSales again
      const filtered = allSales.filter(sale => {
        if (!sale.created_at) return false;
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
        return saleDate === date;
      });
      
      console.log('🔄 Client-side filtering found:', filtered.length, 'sales');
      return filtered;
    }
  }, [allSales]); // ✅ Now this function is stable

  return {
    loading,
    error,
    createSale,
    getSales,
    getAllSales,  
    getTodaySales,
    getSalesByDate,
  };
};