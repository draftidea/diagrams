const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

let windows = [];

function createWindow() {
    let win = new BrowserWindow({
        width: 1024,
        height: 800
    });

    windows.push(win);

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    win.webContents.openDevTools();

    win.on('closed', ()=>{
        win = null;
    });
    
}

app.on('ready', createWindow);

app.on('window-all-closed', ()=>{
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', ()=>{
    if (win === null) {
        createWindow();
    }
});
