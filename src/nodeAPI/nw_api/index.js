import {getCookie} from "../../renderer/utils/auth";

const url = require('../../../package.json').main;
const wConfig = JSON.parse(JSON.stringify(require('../../../.electron-vue/buildConfig').nw.window));
wConfig.setShowInTaskbar = wConfig.show_in_taskbar;
delete wConfig.show_in_taskbar;
const uuidV1 = require('uuid/v1');
const uuid = _ => sessionStorage.getItem('uuid');
if (!uuid()) sessionStorage.setItem('uuid', uuidV1());

class sendTemplate {
    constructor(obj) {
        this.from = uuid();
        this.to = obj.to || '*';
        this.type = obj.type || 1;
        this.needResponse = obj.needResponse || 0;
        this.title = obj.title || false;
        const getObjData = obj => {
            const flagOrg = {};
            for (const key in obj) {
                if (!/^(form|to|type|title|data)$/.test(key)) {
                    flagOrg[key] = obj[key];
                }
            }
            return flagOrg;
        };
        this.data = obj.data ? obj.data : getObjData(obj);
    }
}

/*从这里往下可以书写业务逻辑*/
const tray = new nw.Tray({title: '侧边栏', icon: 'static/logo.png'});
const menu = tray.menu || new nw.Menu();
/*任务栏图标，创建*/
const updateIconMenu = (item, isNew = true) => {
    if (isNew) {
        menu.append(new nw.MenuItem({
            type: 'normal',
            label: item.label,
            uuid: item.uuid,
            click() {
                /*fixme 这里的窗口对象获取 不正确 需要调整为获取对应窗口*/
                nw.Window.get().enterFullscreen();
            }
        }));
    } else {

    }

    tray.menu = menu;
};
const getId = uuid => {
    let id;
    businessWinList.some(v => {
        if (v.uuid === uuid) {
            id = v.id;
        }
    });
    return id;
};
let businessWinList = [{id: null, uuid: uuid()}];
/*
* postMessage 数据结构
* {
*   from:uuid()//发送者uuid,
*   to:uuid2//收件人 uuid或all(默认)
*   type:0,//1:res相应  或  0:req请求
*   title:'updateWinState'//指定请求归属类型
*   data:{//数据体
*       id:'111',//用户id
*       username:'封鬼',//用户名称
*       ...
*   }
* }
* */
let port = chrome.runtime.connect();
chrome.runtime.onConnect.addListener(function (childPort) {
    childPort.onMessage.addListener(ctx => {
        /*判断是否不是发送给自己的*/
        if (ctx.to !== uuid() && ctx.to !== '*') return false;
        const data = ctx.data;
        switch (ctx.title) {
            case 'updateWinState':
                let isNew = true;
                businessWinList.some(v => {
                    if (v.uuid === data.uuid) {
                        v.id = data.id;
                        isNew = false;
                        return true;
                    }
                });
                isNew && businessWinList.push(data);
                console.log('你好，我是' + ctx.from);
                updateIconMenu({uuid: ctx.from, label: data.id ? data.username || '未命名' : '新窗口4'});
                data.needResponse && (() => {
                    let port = chrome.runtime.connect();
                    port.postMessage({
                        title: 'updateWinState',
                        to: ctx.from,
                        id: getId(uuid()),
                        username: getCookie('username')
                    });
                })();
                break;
            default:
                return false;
        }
    });
});

port.postMessage(new sendTemplate({
    needResponse: 1,//1:需要响应  或  0:不需要相应
    title: 'updateWinState',//指定请求归属类型
    id: null,//用户id
    /*fixme 这里需要获取到用户真实用户名*/
    username: `新窗口`
}));

updateIconMenu({uuid: uuid(), label: '新窗口'});

export default {
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
    newBusinessWin() {
        nw.Window.open(url, {}, function (win) {
        });
    },
    sendMsg(msg) {
        console.log(businessWinList);
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
        console.log('发起登陆');
        updateIconMenu({label: accountID, uuid: uuid()}, false);
    }
};
