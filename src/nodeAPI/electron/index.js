const {ipcRenderer: ipc} = require('electron');
module.exports = {
    windowHandle(type) {
        ipc.send(type);
    }
};