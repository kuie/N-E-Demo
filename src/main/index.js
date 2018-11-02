const uuidV1 = require('uuid/v1');
import {app, BrowserWindow, globalShortcut, ipcMain, Menu, remote, session, Tray} from 'electron'
import {autoUpdater} from 'electron-updater'

const path = require('path');

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

let appIcon = null;
const businessWinList = [];

const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}/index.html`;
const updateIconMenu = _ => {
    let MenuList = businessWinList.map(item => {
        return {
            label: item.username,
            click() {
                item.win.focus();
            }
        }
    });
    const contextMenu = Menu.buildFromTemplate(MenuList);
    appIcon.setToolTip('在托盘中的 Electron 示例.');
    appIcon.setContextMenu(contextMenu)
};

const createRendererWindow = _ => {
    let win = new BrowserWindow(wConfig);
    /*子窗口关闭事件*/
    win.on('closed', () => {
        let index = -1;
        businessWinList.some((item, i) => {
            if (win === item.win) {
                index = i;
            }
        });
        if (index >= 0) {
            businessWinList.splice(index, 1);
            updateIconMenu();
        }
        win = null;
    });
    /*加载页面后展示页面*/
    win.once('ready-to-show', () => {
        win.show(true);
    });
    businessWinList.push({id: null, win, uuid: uuidV1(), username: '未登录'});
    updateIconMenu();
    win.loadURL(winURL);
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
    const iconPath = process.env.NODE_ENV === 'development' ?
        path.resolve(__dirname, '..', '..', 'build', 'icons', 'icon.ico') :
        `${__static}/icon.ico`;
    appIcon = new Tray(iconPath);
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
    ipcMain.on('newBusinessWin', e => createRendererWindow());
    ipcMain.on('searchLoginState', (e, id) => {
        let result = false;
        businessWinList.some(item => {
            if (item.id === id) {
                result = true;
            }
            return result;
        });
        e.returnValue = result;
    });
    ipcMain.on('loginBroadcast', (e, arg) => {
        businessWinList.some(item => {
            if (arg.uuid === item.uuid) {
                item.id = arg.accountID;
                item.username = arg.username;
                updateIconMenu();
            }
        })
    });
    ipcMain.on('giveMyID', e => e.returnValue = businessWinList[businessWinList.length - 1].uuid);
    //注册全局快捷键
    // globalShortcut.register('F12', () => {
    //     mainWindow.openDevTools();
    // });
    createRendererWindow();
}

app.on('ready', createWindow);

app.on('activate', () => {
    if (!businessWinList.length) {
        createRendererWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
    if (appIcon) appIcon.destroy()
});

app.setJumpList([
    {
        type: 'custom',
        name: 'Recent Projects',
        items: [
            {type: 'file', path: 'C:\\Projects\\project1.proj'},
            {type: 'file', path: 'C:\\Projects\\project2.proj'}
        ]
    },
    { // has a name so `type` is assumed to be "custom"
        name: 'Tools',
        items: [
            {
                type: 'task',
                title: 'Tool A',
                program: process.execPath,
                args: '--run-tool-a',
                icon: process.execPath,
                iconIndex: 0,
                description: 'Runs Tool A'
            },
            {
                type: 'task',
                title: 'Tool B',
                program: process.execPath,
                args: '--run-tool-b',
                icon: process.execPath,
                iconIndex: 0,
                description: 'Runs Tool B'
            }
        ]
    },
    {type: 'frequent'},
    { // has no name and no type so `type` is assumed to be "tasks"
        items: [
            {
                type: 'task',
                title: 'New Project',
                program: process.execPath,
                args: '--new-project',
                description: 'Create a new project.'
            },
            {type: 'separator'},
            {
                type: 'task',
                title: 'Recover Project',
                program: process.execPath,
                args: '--recover-project',
                description: 'Recover Project'
            }
        ]
    }
]);

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
