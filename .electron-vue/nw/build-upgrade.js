const path = require('path');
const fs = require('fs');
// get config
const config = require('./config');
const setupCnf = config.build.nw.setup;
const updCnf = config.build.nw.upgrade;
// const platforms = ['win32', 'win64', 'osx32', 'osx64', 'linux32', 'linux64']
const platforms = {
    'win32-setup': {
        name: 'win32',
        ext: '.exe'
    },
    'win64-setup': {
        name: 'win64',
        ext: '.exe'
    },
    'osx32': {
        name: 'osx32',
        ext: '.app'
    },
    'osx64': {
        name: 'osx64',
        ext: '.app'
    },
    'linux32': {
        name: 'linux32',
        ext: '.gz'
    },
    'linux64': {
        name: 'linux64',
        ext: '.gz'
    }
};
// makeUpgrade({ name: 'vue-nw-seed', appName: '应用的中文别名', version: '0.1.0' })
const makeUpgrade = manifest => new Promise((resolve, reject) => {
    try {
        //try to do sth
        let upgradeJson = Object.assign({}, manifest, {packages: {}});
        // due to files
        updCnf.files.forEach(function (curPath) {
            let files = fs.readdirSync(curPath);

            files.forEach(function (fileName) {
                let platform = platforms[fileName];
                if (!platform) return;

                let filePath = getFilePath(manifest, platform, fileName);
                let size = getFileSize(curPath, manifest, platform, fileName);
                upgradeJson.packages[platform.name] = {url: updCnf.publicPath + filePath, size: size};
            });
            makeJson(upgradeJson);
        });
        resolve();
    } catch (err) {
        reject(err);
    }
});
const getFilePath = (manifest, platform, fileName) => `${manifest.version}/${getFile(manifest, platform, fileName)}`;
const getFileSize = (curPath, manifest, platform, fileName) => fs.statSync(path.resolve(curPath, getFile(manifest, platform, fileName))).size;
const getFile = (manifest, platform, fileName) => {
    let name = manifest.name;
    if (typeof setupCnf.outputFileName === 'function') {
        name = setupCnf.outputFileName({name: manifest.name, version: manifest.version, platform});
    }
    return fileName + '/' + name + platform.ext;
};
const makeJson = json => {
    let upgradeAssetsRoot = path.parse(updCnf.outputFile).dir;
    if (!fs.existsSync(upgradeAssetsRoot)) fs.mkdirSync(upgradeAssetsRoot);
    fs.writeFileSync(updCnf.outputFile, JSON.stringify(json, null, '  '), 'utf-8');
    console.log('\n', 'build upgrade.json in:', updCnf.outputFile, '\n\n\n\n');
};

module.exports = makeUpgrade;