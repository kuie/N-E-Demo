const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const exec = require('child_process').exec;
const readLine = require('readline');
const baseUrl = 'http://localhost/update/electron/';
const os = require('os');
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu5bqEVlWSY4BQbMOyPQ0
FOhppCuwPOkqeSFD1U/RCk0q9ZgWqqwn/60dLulGf/Xg6Y65tRqiF/3axTkNincG
ZVZec1mXJ7oV4ohM+juAV6L7pUcErYCIqWqUqZkbcQ0okQAaDDHttwvDhWdfDSYL
+WY0gbVPFR0lqjtSnZMQT3FMU9pGKRcwxE9IwMzuPZZP3cH0i0oP3or3CcPMtpEt
z9dvl6YWJdHFMEfi7yRn71wglbBq0gOsv2zpbhu0Vh86S1qjY+ZxVKOj7P/nB2Sb
I4jN1p7amFZWBQx7+JKMFc5BpAsH++RtLgDhyKYU8TVIhNvizcHTibBY1TmDvec7
8wIDAQAB
-----END PUBLIC KEY-----`;
const platform = (platform => {
    switch (platform) {
        case 'win32':
            return 'win';
        case 'darwin':
            return 'darwin';
        case 'linux':
            return 'linux';
    }
})(os.platform());

//创建文件夹
const createDir = (target) => {
    target = path.normalize(target);
    let arr = path.parse(target).dir.split(path.sep);
    arr.forEach((str, index) => {
        let p = path.join(...arr.slice(0, index + 1));
        if (!fs.existsSync(p)) fs.mkdirSync(p)
    });
};
//复制copyAsar文件
const copyAsar = (from, to) => {
    from = path.normalize(from);
    to = path.normalize(to);
    createDir(to);
    return new Promise((resolve, reject) => {
        exec(`copy ${from} ${to}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`出错: ${error}`);
                resolve(-1);
                return;
            }
            if (stderr) {
                resolve(0);
            } else {
                resolve(200);
            }
        });
    });
};
//复制文件夹
const copyDir = (from, to) => {
    const fromArr = path.normalize(from).split(path.sep);
    const toArr = path.normalize(to).split(path.sep);
    const len = fromArr.length;
    const RFList = walk(from);
    return Promise.all(RFList.map(p => {
        return new Promise((resolve, reject) => {
            const pArr = path.normalize(p).split(path.sep);
            const fp = pArr.join(path.sep);
            pArr.splice(0, len, ...toArr);
            const tp = pArr.join(path.sep);
            createDir(tp);
            /*文件写入部分*/
            copyAsar(fp, tp.replace(/\.asar-cache/, '.asar')).then(code => resolve({code}));
        });
    }));
};
//读取log文件并转为数组数据
const log2Arr = logPath => fs.readFileSync(logPath).toString()
    .split(/\n/).map(str => {
        const ar = str.split('>');
        return {path: ar[0], hash: ar[1]};
    });
//数组转为对象数据
const arr2Obj = arr => {
    const obj = {};
    arr.forEach(item => obj[item.hash] ?
        obj[item.hash].push(item.path) :
        obj[item.hash] = [item.path]);
    return obj;
};
//使用对象数据过滤数组数据
const oaFilter = (arr, obj) => arr.filter(item => item.hash && item.path ?
    obj[item.hash] && obj[item.hash] instanceof Array ?
        obj[item.hash].indexOf(item.path) === -1 :
        true : false);
// 获取全部文件路径
const walk = dir => {
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
};
//删除文件
const delAll = filePath => {
    if (filePath instanceof Array) return filePath.map(fp => delAll(fp));
    filePath = path.normalize(filePath);
    if (!fs.existsSync(filePath)) return false;
    if (fs.statSync(filePath).isDirectory()) {
        const files = fs.readdirSync(filePath);
        files.forEach(file => {
            const curPath = `${filePath}/${file}`;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                delAll(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(filePath);
    } else {
        fs.unlinkSync(filePath);
    }
    return Promise.resolve();
};
let basePath = '';
//打印日志
const nodeLog = log => fs.appendFileSync(path.join(basePath, 'logMessage.log'), `${new Date()}-->${JSON.stringify(log)}\n`, 'utf-8');
//重启
const relaunch = app => {
    app.relaunch();
    app.exit(0);
};
//对称解密
const aesDecrypt = (encrypted, key) => {
    const decipher = crypto.createDecipher('aes192', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

export default (ops) => {
    let delArr = [];
    const {app, version, installPath} = ops;
    basePath = installPath;
    nodeLog(`platform:${platform}`);
    let lastVersion = '';
    /*todo 等待测试 加密后的自动更新系统*/
    const getHashMap = version => new Promise((resolve, reject) => {
        /*获取版本对称密钥*/
        nodeLog(`getHashMap 请求地址：${baseUrl}v${version}/key-v${version}`);
        http.get(`${baseUrl}v${version}/key-v${version}`, res => res.on('data', chucks => resolve(crypto.publicDecrypt(publicKey, chucks))));
    }).then(pwd => new Promise((resolve, reject) => {
        nodeLog(`对称密钥:${pwd}`);
        nodeLog(`请求当前版本hashMap，地址:${baseUrl}v${version}/hashMap-v${version}-${platform}.txt`);
        http.get(`${baseUrl}v${version}/hashMap-v${version}-${platform}.txt`, res => {
            const lastHashMapPath = path.join(installPath, `hashMap-v${version}`);
            const ws = fs.createWriteStream(lastHashMapPath);
            const rl = readLine.createInterface({
                input: res,
                crlfDelay: Infinity
            });
            rl.on('line', line => ws.write(`${decodeURI(aesDecrypt(line, pwd))}\n`));
            rl.on('close', () => ws.end(() => resolve(lastHashMapPath)));
        });
    }));
    /*
    * 自主AutoUpdate
    * 更新业务流程
    * 1.获取hash表
    * 2.下载更新文件到缓存区
    * 3.解析asar包到指定缓存文件夹
    * 3.更新文件
    * 4.打包asar文件包
    * 5.复制原文件到历史文件夹
    * 6.退出app 并更新缓存区中的文件
    * 7.删除缓存文件并重启app
    * */
    //获取hash文件
    nodeLog(`hashMap是否存在？：${fs.existsSync(path.join(installPath, `hashMap-v${version}`))}`);
    new Promise((resolve, reject) => fs.existsSync(path.join(installPath, `hashMap-v${version}`)) ?
        resolve() :
        getHashMap(version).then(resolve))
    //获取最新版本号
        .then(() => {
            nodeLog('开始获取最新版本号');
            return new Promise((resolve, reject) => {
                nodeLog('开始获取最新版本号...');
                nodeLog(`最新版本号地址：${baseUrl}lastVersion`);
                http.get(`${baseUrl}lastVersion`, res => {
                    res.on('data', (chunk) => {
                        lastVersion += chunk.toString();
                    });
                    res.on('end', () => resolve(lastVersion));
                });
            })
        })
        //判断是否需要更新并获取最新版本hashMap文件
        .then(lastVersion => {
            nodeLog(`当前版本号：${version} ||| 最新版本号：${lastVersion}`);
            if (version === lastVersion) {
                //无需更新
                nodeLog('版本号相同 无需更新');
                return Promise.reject('No update!');
            } else {
                nodeLog('需要更新');
                return getHashMap(lastVersion).then(n => Promise.resolve({
                    n,
                    o: path.join(installPath, `hashMap-v${version}`)
                }));
            }
        })
        //分析更细内容并下载文件
        .then((HM) => {
            nodeLog(HM);
            const oha = log2Arr(HM.o), nha = log2Arr(HM.n);
            const oho = arr2Obj(oha), nho = arr2Obj(nha);
            const addArr = oaFilter(nha, oho);
            delArr = oaFilter(oha, nho);
            nodeLog(`addArr`);
            nodeLog(addArr);
            if (addArr.length) {
                nodeLog(`新增文件${addArr.length}个`);
                const cacheDir = path.join(installPath, `cacheData-${lastVersion}`);
                return Promise.all(addArr.map(item => new Promise((resolve, reject) => {
                    let code = -1;
                    const url = item.path.replace(/^[/\\]+/, `${baseUrl}v${lastVersion}/${platform}/${platform}-ia32-unpacked/`).replace(/\\+/g, '/');
                    nodeLog(`url:${url}`);
                    const filePath = path.normalize(`${cacheDir}${item.path}`);
                    nodeLog(`filePath:${filePath}`);
                    createDir(filePath);
                    const hash = crypto.createHash('md5');
                    http.get(url, res => {
                        const ws = fs.createWriteStream(filePath.replace(/\.asar$/, '.asar-cache'));
                        res.on('data', chucks => {
                            ws.write(chucks);
                            hash.update.bind(hash)(chucks);
                        });
                        res.on('end', () => ws.end(() => {
                            const newHash = hash.digest('hex');
                            nodeLog({oldHash: item.hash, newHash, path: item.path});
                            code = item.hash === newHash ? 200 : 100;
                            resolve({path: item.path, code});
                        }));
                        res.on('error', e => resolve({path: item.path, code: 0}));
                    });
                })))
            } else {
                return Promise.reject({code: 15});
            }
        })
        //判断文件下载状态
        .then(res => {
            nodeLog(res);
            const cacheDir = path.join(installPath, `cacheData-${lastVersion}`);
            let resultArr = res.filter(result => result.code !== 200);
            if (resultArr.length) {
                resultArr.forEach(item => {
                    switch (item.code) {
                        case 0 :
                            return nodeLog(`${item.path}下载失败`);
                        case -1:
                            return nodeLog(`${item.path}下载器故障`);
                        case 100:
                            /*todo 删除错误文件*/
                            return nodeLog(`${item.path}文件错误`);
                    }
                    nodeLog(`${item.path}下载失败`);
                });
            } else {
                nodeLog('更新文件下载完毕');
                nodeLog({from: cacheDir, to: installPath});
                copyDir(cacheDir, installPath).then(res => {
                    /*hashMap更新*/
                    // delAll(path.join(installPath, `hashMap-v${version}`));
                    copyDir(path.join(installPath, `hashMap-v${lastVersion}-last`), path.join(installPath, `hashMap-v${lastVersion}`));
                    delAll(path.join(installPath, `hashMap-v${lastVersion}-last`));
                    /*删除更新缓存文件*/
                    delAll(path.join(installPath, `cacheData-${lastVersion}`));
                    if (delArr.length) {
                        delAll(delArr).then(() => relaunch(app));
                    } else {
                        relaunch(app);
                    }
                });
            }
        })
        .catch(err => {
            switch (err.code) {
                case 15:
                    return nodeLog({err: '无新增或修改文件'});
            }
        });
};

/* todo
* electron 生产模式下打包正常 使用正常
* 但独立更新asar文件后出现第一次重启白屏问题
* 如果直接使用新的asar文件替换旧的asar文件可一次重启正常更新
* 怀疑出现了依赖包不能找到的问题因此需要打开开发工具进行查看
* 具体决绝方式待定
* */