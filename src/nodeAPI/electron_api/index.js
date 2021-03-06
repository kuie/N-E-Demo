import {getCookie} from "../../renderer/utils/auth";

const {ipcRenderer: ipc} = require('electron');
const uuid = _ => sessionStorage.getItem('uuid');
//回话持久化uuid
!uuid() && sessionStorage.setItem('uuid', ipc.sendSync('giveMyID'));
ipc.on('log', (e, arg) => console.log(arg));
ipc.on('lock-screen', (e, arg) => window.dispatchEvent(new Event('lock-screen')));
ipc.on('unlock-screen', (e, arg) => window.dispatchEvent(new Event('unlock-screen')));
ipc.on('suspend', (e, arg) => window.dispatchEvent(new Event('suspend')));
ipc.on('resume', (e, arg) => window.dispatchEvent(new Event('resume')));


export default {
    /*顶部条基础操作 最大，最小，关闭*/
    windowHandle(type) {
        ipc.send(type, uuid());
    },
    /*新建窗口*/
    newBusinessWin() {
        ipc.send('newBusinessWin');
    },
    /*查询该账号是否已登录*/
    searchLoginState(id) {
        return ipc.sendSync('searchLoginState', id);
    },
    sendMsg(msg) {

    },
    /*登陆广播*/
    loginBroadcast(accountID) {
        ipc.send('loginBroadcast', {uuid: uuid(), accountID, username: getCookie('username')});
    }
};