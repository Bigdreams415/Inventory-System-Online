import { dbService } from './database';
import { Product, ApiResponse, PaginatedResponse } from '../types';

export class ProductModel {
  // Get all products with optional pagination
  static async getAll(limit?: number, offset?: number): Promise<Product[]> {
    let query = 'SELECT * FROM products ORDER BY name';
    const params: any[] = [];

    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    if (offset !== undefined) {
      query += ' OFFSET ?';
      params.push(offset);
    }

    return await dbService.all<Product>(query, params);
  }

  // Get total count of products
  static async getCount(): Promise<number> {
    const result = await dbService.get<{ count: number }>('SELECT COUNT(*) as count FROM products');
    return result?.count || 0;
  }

  // Get product by ID
  static async getById(id: string): Promise<Product | undefined> {
    const query = 'SELECT * FROM products WHERE id = ?';
    return await dbService.get<Product>(query, [id]);
  }

  // Get product by barcode
  static async getByBarcode(barcode: string): Promise<Product | undefined> {
    const query = 'SELECT * FROM products WHERE barcode = ?';
    return await dbService.get<Product>(query, [barcode]);
  }

  // Create new product
  static async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO products (id, name, price, stock, category, description, barcode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await dbService.run(query, [
      id,
      productData.name,
      productData.price,
      productData.stock,
      productData.category,
      productData.description || null,
      productData.barcode || null
    ]);

    const newProduct = await this.getById(id);
    if (!newProduct) {
      throw new Error('Failed to create product');
    }
    
    return newProduct;
  }

  // Update product
  static async update(id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> {
    const fields = [];
    const values = [];

    if (productData.name !== undefined) {
      fields.push('name = ?');
      values.push(productData.name);
    }
    if (productData.price !== undefined) {
      fields.push('price = ?');
      values.push(productData.price);
    }
    if (productData.stock !== undefined) {
      fields.push('stock = ?');
      values.push(productData.stock);
    }
    if (productData.category !== undefined) {
      fields.push('category = ?');
      values.push(productData.category);
    }
    if (productData.description !== undefined) {
      fields.push('description = ?');
      values.push(productData.description);
    }
    if (productData.barcode !== undefined) {
      fields.push('barcode = ?');
      values.push(productData.barcode);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    await dbService.run(query, values);

    const updatedProduct = await this.getById(id);
    if (!updatedProduct) {
      throw new Error('Product not found after update');
    }

    return updatedProduct;
  }

  // Delete product
  static async delete(id: string): Promise<void> {
    const query = 'DELETE FROM products WHERE id = ?';
    const result = await dbService.run(query, [id]);
    
    if (result.changes === 0) {
      throw new Error('Product not found');
    }
  }

  // Search products
  static async search(searchTerm: string, limit: number = 50): Promise<Product[]> {
    const query = `
      SELECT * FROM products 
      WHERE name LIKE ? OR category LIKE ? OR barcode LIKE ?
      ORDER BY 
        CASE 
          WHEN name LIKE ? THEN 1
          WHEN category LIKE ? THEN 2
          ELSE 3
        END,
        name
      LIMIT ?
    `;
    const searchPattern = `%${searchTerm}%`;
    return await dbService.all<Product>(query, [
      searchPattern, searchPattern, searchPattern,
      searchPattern, searchPattern,
      limit
    ]);
  }

  // Update stock with transaction support
  static async updateStock(id: string, newStock: number): Promise<void> {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const query = 'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await dbService.run(query, [newStock, id]);
    
    if (result.changes === 0) {
      throw new Error('Product not found');
    }
  }

  // Get low stock products
  static async getLowStock(threshold: number = 10): Promise<Product[]> {
    const query = 'SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC, name';
    return await dbService.all<Product>(query, [threshold]);
  }

  // Get products by category
  static async getByCategory(category: string): Promise<Product[]> {
    const query = 'SELECT * FROM products WHERE category = ? ORDER BY name';
    return await dbService.all<Product>(query, [category]);
  }

  // Get all categories
  static async getCategories(): Promise<string[]> {
    const results = await dbService.all<{ category: string }>('SELECT DISTINCT category FROM products ORDER BY category');
    return results.map(row => row.category);
  }
}