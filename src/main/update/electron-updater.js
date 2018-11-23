const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const baseUrl = 'http://localhost/update/electron/';
export default (version, installPath) => {
    const nodeLog = log => fs.appendFileSync(path.join(installPath, 'logMessage.log'), `${new Date()}-->${JSON.stringify(log)}\n`, 'utf-8');
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
    new Promise((resolve, reject) =>
        fs.exists(path.join(installPath, `hashMap-v${version}`), exists => {
            if (exists) {
                resolve()
            } else {
                http.get(`${baseUrl}hashMap-v${version}`, res => {
                    const ws = fs.createWriteStream(path.join(installPath, `hashMap-v${version}`));
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => ws.write(chunk));
                    res.on('end', () => ws.end(resolve));
                }).on('error', (e) => reject(e));
            }
        }))
    //获取最新版本号
        .then(() => new Promise((resolve, reject) => {
            http.get(`${baseUrl}lastVersion`, res => {
                let lastVersion = '';
                res.on('data', (chunk) => {
                    lastVersion += chunk.toString();
                });
                res.on('end', () => resolve(lastVersion));
            });
        }))
        //判断是否需要更新并获取最新版本hashMap文件
        .then(lastVersion => {
            // if (version === lastVersion) {
            //无需更新
            // return Promise.reject('No update!');
            // } else {
            // 获取新的hash表
            return new Promise((resolve, reject) => {
                http.get(`${baseUrl}hashMap-v${lastVersion}`, res => {
                    const lastHashMapPath = path.join(installPath, `hashMap-v${lastVersion}-last`);
                    const ws = fs.createWriteStream(lastHashMapPath);
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => ws.write(chunk));
                    res.on('end', () => ws.end(() => resolve({
                        o: path.join(installPath, `hashMap-v${version}`),
                        n: lastHashMapPath
                    })));
                }).on('error', (e) => reject(e));
            })
            // }
        })
        //分析更细内容
        .then((HM) => {
            //读取log文件并转为数组数据
            const log2Arr = logPath => fs.readFileSync(logPath).toString()
                .split(/\n/).map(str => {
                    const ar = str.split('-->');
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
            const oaFilter = (arr, obj) => arr.filter(
                item => item.hash && item.path ?
                    obj[item.hash] && obj[item.hash] instanceof Array ?
                        obj[item.hash].indexOf(item.path) === -1 :
                        true :
                    false
            );
            const oha = log2Arr(HM.o), nha = log2Arr(HM.n);
            const oho = arr2Obj(oha), nho = arr2Obj(nha);
            const addArr = oaFilter(nha, oho), delArr = oaFilter(oha, nho);
            if (addArr.length) {
                const cacheDir = path.join(installPath, `cacheData-${version}`);

                fs.exists(cacheDir, exists => (!exists) && fs.mkdirSync(cacheDir));
                Promise
                    .all(addArr.map(item => new Promise((resolve, reject) => {
                        const file = path.parse(item.path);
                        let code = -1;
                        let url = item.path.replace(/^\$bp[/\\]+/, `${baseUrl}win-unpacked/`).replace(/\.asar/, '-asar');
                        nodeLog({downloadUrl: url});
                        http.get(url, res => {
                            const filePath = path.join(cacheDir, `${file.base}`);
                            const ws = fs.createWriteStream(filePath);
                            const hash = crypto.createHash('md5');
                            res.setEncoding('utf8');
                            res.on('data', chucks => {
                                ws.write(chucks);
                                hash.update.bind(hash)(chucks);
                            });
                            res.on('end', () => ws.end(() => {
                                code = item.hash === hash.digest('hex') ? 200 : 100;
                                resolve({path: item.path, code});
                            }));
                            res.on('error', e => resolve({path: item.path, code: 0}));
                        });
                    })))
                    .then(res => {
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
                        }
                    });
            } else {
                return Promise.reject({code: 15});
            }
        })
        .catch(err => {
            switch (err.code) {
                case 15:
                    return nodeLog({err: '无新增或修改文件'});

            }
        });
};