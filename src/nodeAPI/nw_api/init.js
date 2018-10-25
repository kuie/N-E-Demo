const tray = new nw.Tray({title: '123123', icon: 'static/logo.png'});
const menu = new nw.Menu();
menu.append(new nw.MenuItem({type: 'checkbox', label: 'box1'}));
tray.menu = menu;