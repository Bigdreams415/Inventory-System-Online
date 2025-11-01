import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';

// Professional database path handling
let dbPath: string;

if (isDev) {
  // Development: Use project root
  dbPath = path.join(process.cwd(), '../../database.sqlite');
} else {
  // Production: Use proper data directory
  const userDataPath = process.env.USER_DATA_PATH || 
    path.join(require('os').homedir(), '.pos-inventory');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  dbPath = path.join(userDataPath, 'database.sqlite');
}

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const initializeDatabase = (): Promise<sqlite3.Database> => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database at:', dbPath);
        
        // Enable foreign keys and better performance settings
        db.serialize(() => {
          db.run('PRAGMA foreign_keys = ON');
          db.run('PRAGMA journal_mode = WAL');
          db.run('PRAGMA synchronous = NORMAL');
          db.run('PRAGMA cache_size = -64000'); // 64MB cache
        });

        createTables(db).then(() => resolve(db)).catch(reject);
      }
    });
  });
};

const createTables = (db: sqlite3.Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    const productsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        category TEXT NOT NULL,
        description TEXT,
        barcode TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const salesTable = `
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        total REAL NOT NULL CHECK (total >= 0),
        tax REAL NOT NULL DEFAULT 0 CHECK (tax >= 0),
        discount REAL NOT NULL DEFAULT 0 CHECK (discount >= 0),
        final_total REAL NOT NULL CHECK (final_total >= 0),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer')),
        customer_name TEXT,
        customer_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const saleItemsTable = `
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price REAL NOT NULL CHECK (unit_price >= 0),
        total_price REAL NOT NULL CHECK (total_price >= 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
      )
    `;

    const customersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)',
      'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
      'CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method)',
      'CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id)',
      'CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)'
    ];

    const tables = [productsTable, salesTable, saleItemsTable, customersTable, ...indexes];
    let completed = 0;
    let hasError = false;

    const runNext = () => {
      if (hasError || completed >= tables.length) {
        if (hasError) {
          reject(new Error('Failed to create database tables'));
        } else {
          console.log('All database tables and indexes created successfully');
          resolve();
        }
        return;
      }

      const sql = tables[completed];
      db.run(sql, (err) => {
        if (err) {
          console.error('Error executing SQL:', sql, err);
          hasError = true;
          reject(err);
        } else {
          completed++;
          runNext();
        }
      });
    };

    runNext();
  });
};

export { dbPath };