const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../public/logo.png'),  
  });

  // In development, load from React dev server
  // In production, load from built React app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackendServer() {
  if (isDev) {
    console.log('Starting Node.js backend server...');
    
    // Start the backend server
    backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '../server'),
      stdio: 'inherit',
      shell: true
    });

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend server:', err);
    });

    backendProcess.on('exit', (code) => {
      console.log(`Backend server exited with code ${code}`);
    });
  }
}

function stopBackendServer() {
  if (backendProcess) {
    console.log('Stopping backend server...');
    backendProcess.kill();
    backendProcess = null;
  }
}

app.whenReady().then(() => {
  // Start backend server first
  startBackendServer();
  
  // Wait a bit for backend to start, then create window
  setTimeout(() => {
    createWindow();
  }, 3000);
});

app.on('window-all-closed', () => {
  stopBackendServer();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopBackendServer();
});