const { app, BrowserWindow } = require('electron');
const serve = require('electron-serve');
const serveFn = serve.default || serve;
const path = require('path');

const loadURL = serveFn({ directory: 'out' });

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  win.setMenu(null);
  loadURL(win);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
