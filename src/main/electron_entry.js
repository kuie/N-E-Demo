const uuidV1 = require('uuid/v1');
const fs = require('fs');
import {
    app,                            //实例对象
    BrowserWindow,                  //窗口类
    globalShortcut,                 //全局快捷键
    ipcMain,                        //主进程
    Menu,                           //菜单
    remote,                         //远程
    session,                        //会话对象
    Tray,                           //任务栏图标
    Notification,                   //通知
    powerMonitor,                   //电源监控
    dialog                          //弹窗
} from 'electron'
// import {autoUpdater} from 'electron-updater'
import electronUpdate from './update/electron-updater';

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
const logPath = path.resolve(app.getPath('exe').replace(/\\[\w-_]+\.exe$/, ''), 'mainProcessLog.log');
const mainLog = log => fs.appendFileSync(logPath, `${new Date()}-->${JSON.stringify(log)}\n`, 'utf-8');

/**
 * 通过businessWinList 数组更新任务栏Icon 列表
 * */
let
    createWinBtn = {
        label: '新建窗口',
        click: _ => createRendererWindow()
    };
let quitBtn = {
    label: '退出',
    click: _ => app.quit()
};
let relaunchBtn = {
    label: '重启',
    click: _ => {
        app.relaunch();
        app.exit(0)
    }
};
let quitLaunchBtn = {
    label: '退出实例',
    click: _ => {
        app.relaunch();
    }
};
const updateIconMenu = _ => {
    let MenuList = businessWinList.map(item => {
        return {
            label: item.username,
            click() {
                item.win.focus();
            }
        }
    });
    MenuList.unshift(createWinBtn);
    MenuList.push(quitBtn);
    MenuList.push(relaunchBtn);
    MenuList.push(quitLaunchBtn);
    const contextMenu = Menu.buildFromTemplate(MenuList);
    appIcon.setToolTip('多任务管理');
    appIcon.setContextMenu(contextMenu)
};
/**
 * 生成独立登陆窗口
 * */
const createRendererWindow = _ => {
    mainLog('createWindow');
    let win = new BrowserWindow(wConfig);
    const uuid = uuidV1();
    /*子窗口关闭事件*/
    win.on('close', () => {
        let index = -1;
        businessWinList.some((item, i) => {
            if (win === item.win) {
                index = i;
                return true;
            }
        });
        if (index >= 0) {
            businessWinList.splice(index, 1);
            updateIconMenu();
        }
    });
    win.on('closed', () => win = null);
    /*加载页面后展示页面*/
    win.once('ready-to-show', () => {
        mainLog('window ready to show');
        win.show();
    });
    win.on('error', (e) => {
        mainLog('win 对象出现错误');
        mainLog(e);
    });
    businessWinList.push({id: null, win, uuid, username: '未登录'});
    updateIconMenu();
    mainLog(`开始加载Url:${winURL}`);
    win.loadURL(winURL);
};
/**
 * 获取当前窗口
 * */
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

function createMain() {
    mainLog('app Ready');
    const iconPath = process.env.NODE_ENV === 'development' ?
        path.resolve(__dirname, '..', '..', 'build', 'icons', 'icon.ico') :
        `${__static}/icon.ico`;
    appIcon = new Tray(iconPath);
    //电源监视
    [
        'lock-screen',//锁屏
        'unlock-screen',//解锁
        'suspend',//睡眠
        'resume'//唤醒
    ].forEach(key => powerMonitor.on(key, e => businessWinList.forEach(v => v.win.send(key))));
    //窗口事件处理
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
                console.log(item);
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

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') {
        const installPath = app.getPath('exe').replace(/\\[\w-_]+\.exe$/, '');
        electronUpdate({app, version: app.getVersion(), installPath})
            .finally(() => createMain());
        /*const appPath = {
            appPath: app.getAppPath(),
            home: app.getPath('home'),
            appData: app.getPath('appData'),
            userData: app.getPath('userData'),
            temp: app.getPath('temp'),
            exe: app.getPath('exe'),
            module: app.getPath('module'),
            desktop: app.getPath('desktop'),
            version: app.getVersion()
        };

        let a = {
            "appPath": "C:\\Users\\zp_field\\AppData\\Local\\Programs\\evt1\\resources\\app.asar",
            "home": "C:\\Users\\zp_field",
            "appData": "C:\\Users\\zp_field\\AppData\\Roaming",
            "userData": "C:\\Users\\zp_field\\AppData\\Roaming\\evt1",
            "temp": "C:\\Users\\zp_field\\AppData\\Local\\Temp",
            "exe": "C:\\Users\\zp_field\\AppData\\Local\\Programs\\evt1\\evt1.exe",
            "module": "C:\\Users\\zp_field\\AppData\\Local\\Programs\\evt1\\evt1.exe",
            "desktop": "C:\\Users\\zp_field\\Desktop",
            "version": "0.2.0"
        }*/
    } else {
        return createMain()
    }
});

app.on('activate', () => {
    if (!businessWinList.length) {
        createRendererWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // app.quit()
    }
    // if (appIcon) appIcon.destroy()
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

/*const os = require('os').platform();
// const appVersion = require('../../package.json').version;

let updateFeed = 'http://localhost/update/electron/win-unpacked';

// if (process.env.NODE_ENV !== 'development') {
//     updateFeed = os === 'darwin' ?
//         'https://mysite.com/updates/latest' :
//         'http://download.mysite.com/releases/win32';
// }

autoUpdater.setFeedURL(updateFeed);

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
});

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') {
        autoUpdater.checkForUpdates()
    }
});*/
