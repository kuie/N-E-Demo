const {ipcRenderer: ipc} = require('electron');
const uuid = _ => sessionStorage.getItem('uuid');
module.exports = {
    windowHandle(type) {
        ipc.send(type, uuid());
    },
    newBusinessWin() {
        ipc.send('newBusinessWin');
    }
};
