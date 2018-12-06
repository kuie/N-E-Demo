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
const crypto = require('crypto');
// const {Transform} = require('stream');
const readLine = require('readline');
const version = process.argv[2] || require('../package').version;
const dirList = parentPath => fs.readdirSync(parentPath)
    .map(filename => {
        const fp = path.join(parentPath, filename);
        const stat = fs.statSync(fp);
        if (stat && stat.isDirectory()) return fp;
        return false;
    })
    .filter(v => !!v);
const walk = dir => {
    let children = [];
    fs.readdirSync(dir).forEach(filename => {
        const fp = `${dir}/${filename}`;
        const stat = fs.statSync(fp);
        if (stat && stat.isDirectory()) {
            children = children.concat(walk(fp));
        } else {
            children.push(path.normalize(fp));
        }
    });
    return children;
};

const privateKey = fs.readFileSync(path.resolve(__dirname, 'server.pem')).toString();
const publicKey = fs.readFileSync(path.resolve(__dirname, 'server.pub')).toString();

/*const strFlag = '测试文字';
console.log('publicKey\n', publicKey);
console.log('privateKey\n', privateKey);
const str1 = crypto.publicEncrypt(publicKey, Buffer.from(strFlag));
console.log('公钥加密结果:\n\n', str1, '\n');
const str3 = crypto.privateDecrypt(privateKey, str1);
console.log('私钥解密结果:\n\n', str3.toString(), '\n');
const str2 = crypto.privateEncrypt(privateKey, Buffer.from(strFlag));
console.log('私钥加密结果:\n\n', str2, '\n');
const str4 = crypto.publicDecrypt(publicKey, str2);
console.log('公钥解密结果:\n\n', str4.toString(), '\n');*/
const versionDir = path.join('./build/electron', `v${version}`);
const dl = dirList(path.resolve(__dirname, '..', 'build', 'electron', `v${version}`));
const createPassword = (min, max) => {
    //可以生成随机密码的相关数组
    const num = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const english = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    const ENGLISH = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const special = ["-", "_", "#"];
    const config = num.concat(english).concat(ENGLISH).concat(special);

    //先放入一个必须存在的
    const arr = [];
    arr.push(getOne(num));
    arr.push(getOne(english));
    arr.push(getOne(ENGLISH));
    arr.push(getOne(special));

    //获取需要生成的长度
    const len = min + Math.floor(Math.random() * (max - min + 1));

    for (let i = 4; i < len; i++) {
        //从数组里面抽出一个
        arr.push(config[Math.floor(Math.random() * config.length)]);
    }

    //乱序
    const newArr = [];
    for (let j = 0; j < len; j++) {
        newArr.push(arr.splice(Math.random() * arr.length, 1)[0]);
    }

    //随机从数组中抽出一个数值
    function getOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    return newArr.join("");
};
const randomPWD = createPassword(32, 64);
//写入随机密码
const encryptPWD = crypto.privateEncrypt(privateKey, Buffer.from(randomPWD));
fs.writeFileSync(path.join(versionDir, `key-v${version}`), encryptPWD);
console.log(encryptPWD.length);
console.log(`对称密钥：${crypto.publicDecrypt(publicKey, encryptPWD)}`);

// 对称加密
const aesEncrypt = (data, key) => {
    const cipher = crypto.createCipher('aes192', key);
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

//对称解密
const aesDecrypt = (encrypted, key) => {
    const decipher = crypto.createDecipher('aes192', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

dl.forEach(appPath => {
    const unpackedDir = dirList(appPath).filter(file => !!/unpacked$/.test(file))[0];
    const ws = fs.createWriteStream(path.join(versionDir, `hashMap-v${version}-${path.parse(appPath).base}.txt`));
    Promise.all(walk(unpackedDir).map(fp => new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const rs = fs.createReadStream(fp);
        rs.on('data', hash.update.bind(hash));
        rs.on('end', () => {
            ws.write(aesEncrypt(`${encodeURI(fp.replace(unpackedDir, ''))}>${hash.digest('hex')}`, randomPWD) + '\n');
            resolve();
        });
    }))).then(res => {
        ws.end(() => {
            /* Warning : 加密内容实体过长
            *  需要改为按行加密
            *  加密对称密码 并将对称密码使用密钥加密
            *  原文的md5值作为对称加密密钥
            *  使用私钥加密md5
            *  ps:这操作真TM骚气
            *  廖雪峰[https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001434501504929883d11d84a1541c6907eefd792c0da51000]
            * */
            /* test 检验hashMap */
            /*const rs = fs.createReadStream(path.join(versionDir, `hashMap-v${version}-${path.parse(appPath).base}.txt`));
            const ws = fs.createWriteStream(path.join(versionDir, `hashMap-v${version}-${path.parse(appPath).base}-encode.txt`));
            const rl = readLine.createInterface({
                input: rs,
                crlfDelay: Infinity
            });
            rl.on('line', line => ws.write(`${decodeURI(aesDecrypt(line, randomPWD))}\n`));
            rl.on('close', () => ws.end());*/
        });
    });
});
fs.writeFileSync('./build/electron/lastVersion', version);