/* 更新业务流程
* 1.获取hash表
* 2.下载更新文件到缓存区
* 3.解析asar包到指定缓存文件夹
* 3.更新文件
* 4.打包asar文件包
* 5.复制原文件到历史文件夹
* 6.退出app 并更新缓存区中的文件
* 7.删除缓存文件并重启app
* */
/* 创建hash表
* 1.获取文件目录
* 2.解析asar包到临时目录
* 3.获取全部文件hash值并生成hash表
* 4.善后（删除临时文件）
* */
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const crypto = require('crypto');
// const appPath = app.getAppPath();
const appPath = path.resolve(__dirname, '..', 'build', 'electron', 'win-unpacked');

function walk(dir, basePath) {
    var children = [];
    fs.readdirSync(dir).forEach(function (filename) {
        var fp = dir + "/" + filename;
        var stat = fs.statSync(fp);
        if (stat && stat.isDirectory()) {
            children = children.concat(walk(fp))
        } else {
            children.push(fp)
        }
    });
    return children
}

let walkArr = walk(appPath);
const cacheBasePath = path.resolve(__dirname, 'cache');
Promise.all(walkArr.filter(fp => /\.asar/.test(fp)).map(fp => {
    return new Promise((resolve, reject) => {
        let asarPathReg = new RegExp(`^${JSON.stringify(appPath).replace(/"/g, '')}`);
        let cachePath = path.join(cacheBasePath, fp.replace(asarPathReg, ''));
        exec(`asar e ${fp} ${cachePath}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${err}`);
                return;
            }
            resolve(walk(cachePath));
        });
    });
})).then(res => {
    res.forEach(arr => walkArr = walkArr.concat(arr));
    writerStream = fs.createWriteStream('./build/electron/hashMap');
    const basePath = '$bp';
    const cacheBasePathReg = new RegExp(`^(${JSON.stringify(cacheBasePath).replace(/"/g, '')}|${JSON.stringify(appPath).replace(/"/g, '')})`);
    walkArr.forEach(fp => {
        if (/\.asar$/.test(fp)) return false;
        const hash = crypto.createHash('md5');
        const rs = fs.createReadStream(fp);
        rs.on('data', hash.update.bind(hash));
        rs.on('end', () => writerStream.write(`${fp.replace(cacheBasePathReg, basePath).replace(/\\/g, '\/')}-->${hash.digest('hex')}\n`, 'UTF8'));
    });
});