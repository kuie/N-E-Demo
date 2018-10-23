const {ipcRenderer: ipc} = require('electron');
const obj = {
    winList: {},
    windowHandle(type, window) {
        ipc.send(type, window);
    },
    newBusinessWin(account) {
        ipc.send('newBusinessWin', account);
    }
};
module.exports = obj;
