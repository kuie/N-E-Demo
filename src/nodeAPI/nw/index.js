const gui = require('nw.gui');
const win = gui.Window.get();
module.exports = {
    windowHandle(type) {
        switch (type) {
            case 'min':
                return win.minimize();
            case 'max':
                return win.isFullscreen ? win.leaveFullscreen() : win.enterFullscreen();
            case 'close':
                return win.close();
        }
    }
};