const {ipcRenderer: ipc} = require('electron');
const uuidV1 = require('uuid/v1');
const uuid = _ => sessionStorage.getItem('uuid');
//回话持久化uuid
!uuid() && sessionStorage.setItem('uuid', ipc.send('giveMyID'));
ipc.on('log', (e, arg) => console.log(arg));

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
        console.log(msg);
        console.log(ipc.sendSync('searchLoginState', uuid()));
        // console.log(businessWinList);
        // port.postMessage('test')
    },
    /*登陆广播*/
    loginBroadcast(accountID) {
        ipc.send('loginBroadcast', {uuid: uuid(), accountID});
    }
};