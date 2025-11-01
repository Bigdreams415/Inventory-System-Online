const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Import database functions from the same directory
const { initializeDatabase, productService } = require('./database');

let db;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(
    isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  try {
    console.log('Initializing database...');
    db = await initializeDatabase();
    console.log('Database initialized successfully');
    createWindow();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
});

ipcMain.handle('get-products', async () => {
  try {
    const products = await productService.getAllProducts(db);
    console.log(`Retrieved ${products.length} products from database`);
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
});

ipcMain.handle('create-product', async (event, product) => {
  try {
    console.log('Creating product:', product);
    const newProduct = await productService.createProduct(db, product);
    console.log('Product created successfully:', newProduct);
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
});

ipcMain.handle('update-product', async (event, product) => {
  try {
    console.log('Updating product:', product);
    await productService.updateProduct(db, product);
    console.log('Product updated successfully');
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
});

ipcMain.handle('delete-product', async (event, id) => {
  try {
    console.log('Deleting product:', id);
    await productService.deleteProduct(db, id);
    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
});

ipcMain.handle('search-products', async (event, searchTerm) => {
  try {
    console.log('Searching products for:', searchTerm);
    const products = await productService.searchProducts(db, searchTerm);
    console.log(`Found ${products.length} products matching search`);
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
});

app.on('window-all-closed', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database closed successfully');
      }
    });
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});