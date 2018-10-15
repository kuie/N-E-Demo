import {app, BrowserWindow, ipcMain, globalShortcut, session} from 'electron'

/*session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({responseHeaders: `default-src 'none'`})
});*/

const wConfig = require('../../.electron-vue/buildConfig').electron;
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow;

function createWindow() {
    const winURL = process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`;
    console.log(`winURL:${winURL}`);
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow(wConfig);

    ipcMain.on('min', e => mainWindow.minimize());
    ipcMain.on('max', e => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow.maximize()
        }
    });
    ipcMain.on('close', e => mainWindow.close());
    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.loadURL(winURL);
    mainWindow.on('closed', () => mainWindow = null);
    //注册全局快捷键
    globalShortcut.register('F12', () => {
        mainWindow.openDevTools();
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
app.setUserTasks([
    {
        program: process.execPath,
        arguments: '--new-window',
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'New Window',
        description: 'Create a new window'
    }
]);

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

import {autoUpdater} from 'electron-updater'

const os = require('os').platform();
const appVersion = require('../../package.json').version;

let updateFeed = 'http://localhost/build/electron/win-unpacked';

/*if (process.env.NODE_ENV !== 'development') {
    updateFeed = os === 'darwin' ?
        'https://mysite.com/updates/latest' :
        'http://download.mysite.com/releases/win32';
}*/

autoUpdater.setFeedURL(updateFeed + '?v=' + appVersion);

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
});

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') {
        autoUpdater.checkForUpdates()
    }
});
