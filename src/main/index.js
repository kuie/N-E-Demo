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

let appIcon = null;
const businessWinList = [];
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;
const createRendererWindow = _ => {
    const uuid = uuidV1();
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
        }
        win = null;
    });
    /*加载页面后展示页面*/
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
    ipcMain.on('searchLoginState', (e, uuid) => {
        let result = false;
        businessWinList.some(item => {
            if (item.uuid === uuid) {
                result = true;
            }
            return result;
        });
        e.returnValue = result;
    });
    ipcMain.on('loginBroadcast', (e, arg) => {
        businessWinList.some(item => {
            if (arg.uuid === item.uuid) {
                item.id = arg.accountID
            }
        })

    });


    //注册全局快捷键
    // globalShortcut.register('F12', () => {
    //     mainWindow.openDevTools();
    // });
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

app.on('activate', () => {
    if (!businessWinList.length) {
        businessWinList.push(createRendererWindow());
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
