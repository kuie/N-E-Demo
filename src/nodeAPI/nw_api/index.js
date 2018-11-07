/**
 * 业务逻辑
 *
 * 1.广播询问是否存在主窗口
 *
 * 2.true  => 成为主窗口
 *
 * 2.false => 注册子窗口
 *
 * 3.展开业务逻辑
 * */
import {getCookie} from "../../renderer/utils/auth";

const url = require('../../../package.json').main;
const wConfig = JSON.parse(JSON.stringify(require('../../../.electron-vue/buildConfig').nw.window));
wConfig.setShowInTaskbar = wConfig.show_in_taskbar;
delete wConfig.show_in_taskbar;

/*有uuid 就使用session中的uuid 没有就检查window对象上是否挂载了uuidX 都没有就生成uuid*/
const uuidV1 = require('uuid/v1');
if (!sessionStorage.getItem('uuid')) {
    try {
        sessionStorage.setItem('uuid', uuidX);
    } catch (err) {
        sessionStorage.setItem('uuid', uuidV1());
        sessionStorage.setItem('isMainWindow', true);
    }
}
const uuid = sessionStorage.getItem('uuid');
/*子窗口构造器*/
const createWin = _ => {
    nw.Window.open(url, {}, function (win) {
        /*生成新的uuid并放入win对象*/
        win.window.uuidX = uuidV1();
    });
};
/*主窗口判断*/
const isMainWindow = sessionStorage.getItem('isMainWindow');
let port = chrome.runtime.connect();

/*postMessage 构造器*/
class sendTemplate {
    constructor(obj) {
        this.from = uuid;//发送者uuid
        this.to = obj.to || '*';//接收者uuid或"*"或"main"
        this.type = obj.type || 1;//1:res相应  或  0:req请求
        this.needResponse = obj.needResponse || 0;//0:不需要回复，1:需要回复
        this.title = obj.title || false;//指定请求标题
        this.winType = obj.winType || 'child';//发送者类型 'main'（主进程）\'child'（子进程）
        const getObjData = obj => {
            const flagOrg = {};
            for (const key in obj) {
                if (!/^(form|to|type|title|data|winType)$/.test(key)) {
                    flagOrg[key] = obj[key];
                }
            }
            return flagOrg;
        };//整合数据体
        this.data = obj.data ? obj.data : getObjData(obj);
    }
}

let businessWinList = [];

if (isMainWindow) {
    //任务栏图标
    const tray = new nw.Tray({title: '侧边栏', icon: 'static/logo.png'});
    /*任务栏图标，创建*/
    const updateIconMenu = _ => {
        let menu = nw.Menu();
        menu.append(new nw.MenuItem({
            type: 'normal',
            label: '新建窗口',
            click: () => createWin()
        }));
        businessWinList.forEach(item => {
            menu.append(new nw.MenuItem({
                type: 'normal',
                label: item.username || '新窗口',
                uuid: item.uuid,
                id: item.id,
                click: () => {
                    let port = chrome.runtime.connect();
                    port.postMessage(new sendTemplate({
                        title: 'getFocus',
                        to: item.uuid
                    }))
                }
            }));
        });
        menu.append(new nw.MenuItem({
            type: 'normal',
            label: '退出',
            click: () => {
                nw.App.closeAllWindows();
                nw.App.quit();
            }
        }));
        tray.menu = menu;
    };

    //runtime监听
    chrome.runtime.onConnect.addListener(function (childPort) {
        childPort.onMessage.addListener(ctx => {
            /*只接收主进程请求*/
            if (!/^main$/.test(ctx.to)) return false;
            const data = ctx.data;
            switch (ctx.title) {
                case 'updateWinState':
                    let isNewWin = true;
                    businessWinList.some(item => {
                        if (item.uuid === ctx.from) {
                            item.id = data.id;
                            item.username = data.username;
                            isNewWin = false;
                            return true;
                        }
                    });
                    isNewWin && businessWinList.push({uuid: ctx.from, id: data.id, username: data.username});
                    updateIconMenu();
                    break;
                case 'winClose':
                    console.log(ctx);
                    businessWinList = businessWinList.filter(item => item.uuid !== ctx.from);
                    updateIconMenu();
                    break;
            }
        });
    });
    createWin();
    /*因为任务栏只可以在主进程中使用所以 主进程隐藏窗口并保持不可刷新状态*/
    nw.Window.get().hide();
} else {
    nw.Window.get().on('close', function () {
        let port = chrome.runtime.connect();
        port.postMessage(new sendTemplate({to: 'main', title: 'winClose'}));
        setTimeout(_ => this.close(true), 0);
    });
    /*接受主进程发送来的消息*/
    chrome.runtime.onConnect.addListener(function (childPort) {
        childPort.onMessage.addListener(ctx => {
            /*判断是否不是发送给自己的*/
            if (ctx.to !== uuid && ctx.to !== '*') return false;
            const data = ctx.data;
            switch (ctx.title) {
                case 'getFocus':
                    return nw.Window.get().focus();
                default:
                    return false;
            }
        });
    });

    port.postMessage(new sendTemplate({to: 'main', title: 'updateWinState'}));
}
/*操作功能区*/
const childHandleObject = {
    /*顶部条基础操作 最大，最小，关闭*/
    windowHandle(type) {
        const win = nw.Window.get();
        switch (type) {
            case 'min':
                return win.minimize();
            case 'max':
                return win.isFullscreen ? win.leaveFullscreen() : win.enterFullscreen();
            case 'close':
                return win.close();
        }
    },
    /*新建窗口*/
    newBusinessWin: _ => createWin(),
    sendMsg(msg) {
        console.log(msg);
    },
    /*查询登录状态*/
    searchLoginState(id) {
        let result = false;
        businessWinList.some(item => {
            if (item.id === id) {
                result = id;
            }
            return result;
        });
        return result;
    },
    /*登陆广播*/
    loginBroadcast(accountID) {
        port.postMessage(new sendTemplate({
            title: 'updateWinState',
            id: accountID,
            username: getCookie('username'),
            to: 'main'
        }));
    }
};

export default childHandleObject;