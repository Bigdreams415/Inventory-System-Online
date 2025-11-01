const sqlite3 = require('sqlite3');
const path = require('path');
const { app } = require('electron');

const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev 
  ? path.join(__dirname, '../database.sqlite')
  : path.join(app.getPath('userData'), 'database.sqlite');

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database at:', dbPath);
        createTables(db).then(() => resolve(db)).catch(reject);
      }
    });
  });
};

const createTables = (db) => {
  return new Promise((resolve, reject) => {
    const productsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(productsTable, (err) => {
      if (err) {
        console.error('Error creating products table:', err);
        reject(err);
      } else {
        console.log('Products table ready');
        resolve();
      }
    });
  });
};

const productService = {
  getAllProducts: (db) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM products ORDER BY name';
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  getProductById: (db, id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM products WHERE id = ?';
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Product not found'));
        } else {
          resolve(row);
        }
      });
    });
  },

  createProduct: (db, product) => {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString();
      const query = `
        INSERT INTO products (id, name, price, stock, category) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(query, [id, product.name, product.price, product.stock, product.category], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ ...product, id });
        }
      });
    });
  },

  updateProduct: (db, product) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE products 
        SET name = ?, price = ?, stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db.run(query, [product.name, product.price, product.stock, product.category, product.id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  deleteProduct: (db, id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM products WHERE id = ?';
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  searchProducts: (db, searchTerm) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM products 
        WHERE name LIKE ? OR category LIKE ? 
        ORDER BY name
      `;
      const searchPattern = `%${searchTerm}%`;
      
      db.all(query, [searchPattern, searchPattern], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

module.exports = {
  initializeDatabase,
  productService
};