import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { ApiResponse, PaginatedResponse, Product } from '../types';

export class ProductController {
  // Get all products
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await ProductModel.getAll();
      const response: ApiResponse<Product[]> = {
        success: true,
        data: products
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting products:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch products'
      };
      res.status(500).json(response);
    }
  }

  // Get product by ID
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.getById(id);
      
      if (!product) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Product> = {
        success: true,
        data: product
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting product:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch product'
      };
      res.status(500).json(response);
    }
  }

  // Create new product
  static async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body;
      
      // Validation
      if (!productData.name || !productData.price || !productData.category) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Name, price, and category are required'
        };
        return res.status(400).json(response);
      }

      if (productData.price < 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Price cannot be negative'
        };
        return res.status(400).json(response);
      }

      if (productData.stock < 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Stock cannot be negative'
        };
        return res.status(400).json(response);
      }

      const newProduct = await ProductModel.create(productData);
      const response: ApiResponse<Product> = {
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating product:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create product'
      };
      res.status(500).json(response);
    }
  }

  // Update product
  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productData = req.body;

      // Check if product exists
      const existingProduct = await ProductModel.getById(id);
      if (!existingProduct) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }

      const updatedProduct = await ProductModel.update(id, productData);
      const response: ApiResponse<Product> = {
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating product:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update product'
      };
      res.status(500).json(response);
    }
  }

  // Delete product
  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if product exists
      const existingProduct = await ProductModel.getById(id);
      if (!existingProduct) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }

      await ProductModel.delete(id);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Product deleted successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting product:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete product'
      };
      res.status(500).json(response);
    }
  }

  // Search products
  static async searchProducts(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Search query is required'
        };
        return res.status(400).json(response);
      }

      const products = await ProductModel.search(q);
      const response: ApiResponse<Product[]> = {
        success: true,
        data: products
      };
      res.json(response);
    } catch (error) {
      console.error('Error searching products:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to search products'
      };
      res.status(500).json(response);
    }
  }

  // Update stock
  static async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (typeof stock !== 'number' || stock < 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Valid stock quantity is required'
        };
        return res.status(400).json(response);
      }

      // Check if product exists
      const existingProduct = await ProductModel.getById(id);
      if (!existingProduct) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        return res.status(404).json(response);
      }

      await ProductModel.updateStock(id, stock);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Stock updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating stock:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update stock'
      };
      res.status(500).json(response);
    }
  }
}