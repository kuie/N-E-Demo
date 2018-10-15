const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const nwPath = require('nw').findpath();
const rootPath = require('./rootPath');
const packageJsonPath = path.resolve('./package.json');

module.exports = runNwDev;

function runNwDev(uri = '') {
    if (uri && (uri + '').trim()) {
        tmpJson = require(packageJsonPath);
        tmpJson.main = uri;
        fs.writeFileSync(packageJsonPath, JSON.stringify(tmpJson, null, '  '), 'utf-8');
    }

    let closed;
    let nwDev = exec(nwPath + ' ' + rootPath, {cwd: rootPath}, function (err, stdout, stderr) {
        process.exit(0);
        closed = true;
    });

    nwDev.stdout.on('data', console.log);
    nwDev.stdout.on('error', console.error);

    // 退出时也关闭 NW 进程
    process.on('exit', exitHandle);
    process.on('uncaughtException', exitHandle);

    function exitHandle(e) {
        if (!closed) nwDev.kill();
        console.log(e || '233333, bye~~~');
    }
}
