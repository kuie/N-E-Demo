//通过innosetup 构建安装包
const innosetupCompiler = require('innosetup-compiler');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

// `./package.json`
const tmpJson = require('../../dist/nw/package.json');

// get config
const config = require('./config/index.js');
const setupOptions = config.build.nw.setup;
/*更新配置平台列表，与构建平台列表可能出现不同*/
const platforms = ['win32', 'win64'];

module.exports = function () {
    const res = [];
    /*读取文件夹下文件*/
    const files = fs.readdirSync(path.resolve('build/nw/' + tmpJson.version));
    /*寻找不同平台打包文件*/
    files.forEach(function (fileName) {
        // 这里的fileName是build\nw 文件夹下的 打包文件夹路径
        if (!~platforms.indexOf(fileName)) return;
        const curPath = path.resolve(setupOptions.files, fileName);
        const stats = fs.statSync(curPath);
        if (!stats.isDirectory()) return;
        const options = Object.assign({}, setupOptions, {files: curPath, platform: fileName});
        options.outputPath = options.outputPath || path.resolve(setupOptions.files, fileName + '-setup');
        res.push(makeExeSetup(options));
    });
    return Promise.all(res);
};

//构建可执行文件
function makeExeSetup(opt) {
    const {issPath, files, outputPath, outputFileName, resourcesPath, appPublisher, appURL, appId, platform} = opt;
    const {name, appName, version} = tmpJson;
    const tmpIssPath = path.resolve(path.parse(issPath).dir, '_tmp_' + platform + '.iss');
    const getOutputNameHandle = typeof outputFileName === 'function' ? outputFileName : getOutputName;

    return new Promise(function (resolve, reject) {
        // rewrite name, version to iss
        fs.readFile(issPath, null, function (err, text) {
            if (err) return reject(err);
            //配置 iss 变量
            const str = iconv.decode(text, 'gbk')
                .replace(/_name_/g, name)
                .replace(/_appName_/g, appName)
                .replace(/_version_/g, version)
                .replace(/_outputPath_/g, outputPath)
                .replace(/_outputFileName_/g, getOutputNameHandle({name, version, platform}))
                .replace(/_filesPath_/g, files)
                .replace(/_resourcesPath_/g, resourcesPath)
                .replace(/_appPublisher_/g, appPublisher)
                .replace(/_appURL_/g, appURL)
                .replace(/_appId_/g, appId)
                .replace(/_platform_/g, platform === 'win64' ? '64' : '');
            /*nw打包配置*/
            fs.writeFile(tmpIssPath, iconv.encode(str, 'gbk'), null, function (err) {
                if (err) return reject(err);
                // inno setup start
                innosetupCompiler(tmpIssPath, {gui: true, verbose: false}, err => {
                    fs.unlinkSync(tmpIssPath);
                    if (err) return reject(err);
                    resolve(opt);
                });
            })
        })
    })
}

function getOutputName(data) {
    return data.name;
}
