const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Core IPC listeners for financial calculations
ipcMain.handle('analyze-deal', async (event, dealData) => {
  const dealStructurer = require('./core/dealStructure');
  return dealStructurer.analyzeDeal(dealData);
});

ipcMain.handle('calculate-profit', async (event, dealData) => {
  const profitOptimizer = require('./core/profitOptimizer');
  return profitOptimizer.optimizeDealProfit(dealData);
});
