const {ipcRenderer: ipc} = require('electron');
const uuid = _ => sessionStorage.getItem('uuid');
ipc.on('log', function (e, a, b, c) {
    console.log(e, a, b, c);
});

const obj = {
    windowHandle(type) {
        ipc.send(type, uuid());
    },
    newBusinessWin() {
        ipc.send('newBusinessWin');
    },
    searchLoginAccount() {
        ipc.once('searchLoginAccount', (e, list) => {
            console.log(list);
            // list ? resolve(list) : reject('查询登陆账户列表错误');
        });
        ipc.send('searchLoginAccount');
    },
    loginBroadcast(accountID) {
        ipc.send('loginBroadcast', {uuid: uuid(), accountID});
    }
};

module.exports = obj;
