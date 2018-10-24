const uuidV1 = require('uuid/v1');
import {app, BrowserWindow, globalShortcut, ipcMain, Menu, remote, session, Tray} from 'electron'
import {autoUpdater} from 'electron-updater'

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
let appIcon = null;
const businessWinList = [];
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;
const createRendererWindow = _ => {
    const uuid = uuidV1();
    let win = new BrowserWindow(wConfig);
    win.on('closed', () => {
        let index = -1;
        businessWinList.some((item, i) => {
            if (win === item.win) {
                index = i;
            }
        });
        if (index >= 0) {
            businessWinList.splice(index, 1);
        }
        win = null;
    });
    win.once('ready-to-show', () => win.show());
    win.loadURL(`${winURL}?uuid=${uuid}`);
    /*
    * id:登陆账户id，用来防止同一账户多次在一个客户端登陆
    * win:窗口对象
    * uuid:窗口唯一标识
    * */
    return {id: null, win, uuid};
};
const getWin = uuid => {
    let target;
    businessWinList.some(item => {
        if (item.uuid === uuid) {
            target = item;
            return true;
        }
    });
    return target;
};

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        frame: false,
        useContentSize: true,//自适应框内内容
        show: false,
        nodeIntegration: false,//禁止node集成
        contextIsolation: true,//上下文隔离
    });


    ipcMain.on('min', (e, uuid) => {
        let win = getWin(uuid).win;
        win.minimize();
    });
    ipcMain.on('max', (e, uuid) => {
        let win = getWin(uuid).win;
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });
    ipcMain.on('close', (e, uuid) => {
        let win = getWin(uuid).win;
        win.close();
    });
    ipcMain.on('newBusinessWin', e => businessWinList.push(createRendererWindow()));
    ipcMain.on('searchLoginAccount', e => {
        e.sender.send('searchLoginAccount', businessWinList.filter(v => !!v.id).map(v => v.id));
    });
    ipcMain.on('loginBroadcast', (e, arg) => {
        businessWinList.some(item => {
            if (arg.uuid === item.uuid) {
                item.id = arg.accountID
            }
        })

    });


    mainWindow.on('closed', () => mainWindow = null);
    //注册全局快捷键
    globalShortcut.register('F12', () => {
        mainWindow.openDevTools();
    });
    businessWinList.push(createRendererWindow());

    let tray = new Tray('G:/N-E-Demo/build/icons/icon.ico');
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Item3', type: 'radio', checked: true},
        {label: 'Item4', type: 'radio'}
    ]);
    tray.setToolTip('NEC-Demo');
    tray.setContextMenu(contextMenu)
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
    if (appIcon) appIcon.destroy()
});


app.setUserTasks([
    {
        program: process.execPath,
        // arguments: '--new-window',
        iconPath: process.execPath,
        iconIndex: 0,
        title: '登陆其他账号',
        description: '登陆新账号'
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
