import modules from "../../renderer/store/modules";

const url = require('../../../package.json').main;
const wConfig = JSON.parse(JSON.stringify(require('../../../.electron-vue/buildConfig').nw.window));
wConfig.setShowInTaskbar = wConfig.show_in_taskbar;
delete wConfig.show_in_taskbar;
const uuid = _ => sessionStorage.getItem('uuid');

/*global.winMaster = {
    businessWinList: [],
    publish: (e, data) => {

    }
};*/

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
            console.log(win);
        });
    },
    /*查询登录状态*/
    searchLoginState() {
        return false;
    },
    /*登陆广播*/
    loginBroadcast(accountID) {
        // global.winMaster.publish()
    }
};
