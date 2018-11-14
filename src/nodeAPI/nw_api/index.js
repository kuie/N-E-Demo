import {getCookie} from "../../renderer/utils/auth";

const wConfig = JSON.parse(JSON.stringify(require('../../../.electron-vue/buildConfig').nw.window));
wConfig.setShowInTaskbar = wConfig.show_in_taskbar;
delete wConfig.show_in_taskbar;

/*有uuid 就使用session中的uuid 没有就检查window对象上是否挂载了uuidX 都没有就生成uuid*/
if (!sessionStorage.getItem('uuid')) sessionStorage.setItem('uuid', uuidX);
const uuid = sessionStorage.getItem('uuid');
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
            default:
                return false;
        }
    });
});

port.postMessage(new sendTemplate({to: 'main', title: 'updateWinState'}));
/*操作功能区*/
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