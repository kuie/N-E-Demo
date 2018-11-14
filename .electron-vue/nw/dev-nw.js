const exec = require('child_process').exec;
const nwPath = require('nw').findpath();
const rootPath = require('./rootPath');

const runNwDev = () => {
    let closed;
    let nwDev = exec(`${nwPath} --remote-debugging-port=9999 ${rootPath}`, {cwd: rootPath}, function (err, stdout, stderr) {
        process.exit(0);
        closed = true;
    });

    nwDev.stdout.on('data', console.log);
    nwDev.stdout.on('error', console.error);

    // 退出时也关闭 NW 进程
    process.on('exit', function () {
        console.log('exit');
        exitHandle();
    });
    process.on('uncaughtException', function () {
        console.log('uncaughtException');
        exitHandle();
    });

    function exitHandle(e) {
        if (!closed) nwDev.kill();
        console.log(e || '233333, bye~~~');
    }
};

module.exports = runNwDev;
