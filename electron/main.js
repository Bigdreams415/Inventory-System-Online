const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');  // Switched to fork for better Node script handling (keeps server alive, easier IPC)
const path = require('path');
const fs = require('fs');
const http = require('http');
const isDev = !app.isPackaged;
let mainWindow;
let splashWindow;
let backendProcess;
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();
else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  function createSplash() {
    splashWindow = new BrowserWindow({
      width: 400,
      height: 400,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      transparent: true,
      center: true,
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });
    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
    splashWindow.once('ready-to-show', () => splashWindow.show());
  }
  function createMainWindow() {
    if (mainWindow) return mainWindow.focus();
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      show: false,
      title: 'Solomon Medicals POS',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false,
      },
      icon: path.join(__dirname, isDev ? '../public/logo.png' : '../build/logo.png'),
    });
    const startUrl = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`;
    console.log('🌐 Loading URL:', startUrl);
    mainWindow.loadURL(startUrl);
    mainWindow.once('ready-to-show', () => {
      if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
      }
      mainWindow.show();
      console.log('✅ Main window shown');
    });
    mainWindow.webContents.on('did-fail-load', (event, code, desc) => {
      console.error('❌ Load failed:', code, desc);
    });
    mainWindow.on('closed', () => (mainWindow = null));
    if (isDev) mainWindow.webContents.openDevTools();
  }
  function startBackend() {
    if (backendProcess) return;
    const serverPath = isDev
      ? path.join(__dirname, '../server/index.js')
      : path.join(process.resourcesPath, 'server', 'index.js');
    const nodePath = process.execPath;
    console.log('🚀 Starting backend...', { isDev, serverPath, nodePath });
    if (!fs.existsSync(serverPath)) {
      console.error('❌ Backend not found:', serverPath);
      setTimeout(createMainWindow, 2000);
      return;
    }
    // Fork the server (better for keeping Express alive; no args needed since it's a module)
    backendProcess = fork(serverPath, [], {  // Empty args array—script runs as module
      execPath: nodePath,  // Uses embedded Node from .exe
      cwd: path.dirname(serverPath),  // CRITICAL: Sets working dir to server/ (matches your manual cd test)
      env: { 
        ...process.env, 
        NODE_ENV: isDev ? 'development' : 'production', 
        PORT: '3001' 
      },
      silent: false  // Set to false to inherit stdio initially; we pipe manually below
    });
    // Attach error FIRST (before streams)
    backendProcess.on('error', err => {
      console.error('Backend spawn error:', err.message || err);
      backendProcess = null;
      setTimeout(createMainWindow, 2000);
    });
    backendProcess.on('exit', (code, signal) => {
      console.log('Backend exited with code', code, 'signal', signal);
      backendProcess = null;
      // Only fallback if non-zero exit (code 0 is "success" but unexpected for server)
      if (code !== 0) {
        console.warn('⚠️ Backend stopped—loading UI without backend (offline mode)');
        setTimeout(createMainWindow, 2000);
      }
    });
    // Pipe and log output (now catches everything, including silent exits)
    backendProcess.stdout.on('data', data => {
      const output = data.toString().trim();
      if (output) console.log(`[BACKEND STDOUT] ${output}`);
    });
    backendProcess.stderr.on('data', data => {
      const error = data.toString().trim();
      if (error) console.error(`[BACKEND STDERR] ${error}`);
    });
    // Log disconnect (if IPC issues)
    backendProcess.on('disconnect', () => {
      console.warn('[BACKEND] Process disconnected unexpectedly');
    });
  }
  function stopBackend() {
    if (backendProcess) {
      backendProcess.kill('SIGTERM');
      backendProcess = null;
    }
  }
  function waitForBackend() {
    const MAX_RETRIES = 60;
    let retries = 0;
    const check = () => {
      const req = http.get('http://localhost:3001/api/health', res => {
        console.log('Health check status:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('✅ Backend ready—loading main window');
          createMainWindow();
        } else {
          scheduleRetry();
        }
      });
      req.on('error', (err) => {
        console.log('Health check error:', err.message);
        scheduleRetry();
      });
      req.setTimeout(3000, () => {
        req.destroy();
        scheduleRetry();
      });
    };
    const scheduleRetry = () => {
      retries++;
      console.log(`🔄 Backend poll attempt #${retries}/${MAX_RETRIES}`);
      if (retries >= MAX_RETRIES) {
        console.error('⏰ Backend timeout—loading UI without backend (API features limited)');
        setTimeout(createMainWindow, 1000);
        return;
      }
      setTimeout(check, 500);
    };
    check();
  }
  app.whenReady().then(() => {
    console.log('App ready—starting splash and backend');
    createSplash();
    startBackend();
    waitForBackend();
  });
  app.on('window-all-closed', () => {
    stopBackend();
    if (process.platform !== 'darwin') app.quit();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
  process.on('uncaughtException', err => console.error('Uncaught Exception:', err));
  process.on('unhandledRejection', (reason, p) => console.error('Unhandled Rejection:', reason));
}