import { app, BrowserWindow, screen, shell } from 'electron';
import { join } from 'node:path';

const isDev = process.argv.includes('--dev');
const DEV_URL = 'http://localhost:4200';
const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;

function createWindow() {
  const workArea = screen.getPrimaryDisplay().workAreaSize;

  const window = new BrowserWindow({
    width: Math.min(DESIGN_WIDTH, workArea.width),
    height: Math.min(DESIGN_HEIGHT, workArea.height),
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#15161b',
    title: 'Termo Duelo',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const fitToWindow = () => {
    const [width, height] = window.getContentSize();
    window.webContents.setZoomFactor(Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
  };

  window.on('resize', fitToWindow);
  window.webContents.on('did-finish-load', fitToWindow);
  window.once('ready-to-show', () => window.show());

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    window.loadURL(DEV_URL);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    window.loadFile(join(__dirname, '..', 'dist', 'termo-duelo', 'browser', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
