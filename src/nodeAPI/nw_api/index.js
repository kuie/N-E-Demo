const url = require('../../../package.json').main;
const wConfig = JSON.parse(JSON.stringify(require('../../../.electron-vue/buildConfig').nw.window));
wConfig.setShowInTaskbar = wConfig.show_in_taskbar;
delete wConfig.show_in_taskbar;
const uuidV1 = require('uuid/v1');
const uuid = _ => sessionStorage.getItem('uuid');
const getId = uuid => {
    let id;
    businessWinList.some(v => {
        if (v.uuid === uuid) {
            id = v.id;
        }
    });
    return id;
};
if (!uuid()) sessionStorage.setItem('uuid', uuidV1());
let businessWinList = [{id: null, uuid: uuid()}];
let port = chrome.runtime.connect();
port.postMessage({type: "newWinReq", uuid: uuid(), id: null});
chrome.runtime.onConnect.addListener(function (childPort) {
    childPort.onMessage.addListener(function (data) {
        switch (data.type) {
            case 'newWinReq':
                (function () {
                    let isNew = true;
                    businessWinList.some(v => {
                        if (v.uuid === data.uuid) {
                            v.id = data.id;
                            isNew = false;
                            return true;
                        }
                    });
                    isNew && businessWinList.push({id: data.id, uuid: data.uuid});
                    port.postMessage({type: "newWinRes", businessWinList})
                })();
                break;
            case 'newWinRes':
                (function () {
                    let uuids = businessWinList.map(v => v.uuid);
                    data.businessWinList.forEach(v => {
                        if (!uuids.includes(v.uuid)) {
                            businessWinList.push(v);
                        }
                    });
                })();
                break;
        }
    });
});


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
        port.postMessage('test')
    },
    /*查询登录状态*/
    searchLoginState() {
        let result = false;
        const uuid = uuid();
        businessWinList.some(item => {
            if (item.uuid === uuid) {
                result = true;
            }
            return result;
        });
        return result;
    },
    /*登陆广播*/
    loginBroadcast(accountID) {
        // global.winMaster.publish()
    }
};
