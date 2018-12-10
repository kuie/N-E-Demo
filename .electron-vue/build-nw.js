const path = require('path');
const fs = require('fs');
const manifest = require('./buildConfig').nw;
const config = require('./nw/config');

const manifestPath = path.resolve(config.build.assetsRoot, 'package.json');

module.exports = new Promise((resolve, reject) => fs.writeFile(manifestPath, JSON.stringify(manifest, null, '  '), 'utf-8', function (err) {
    if (err) reject(err);
    // 开始构建app
    if (config.build.nw.builder) {
        const NwBuilder = require('nw-builder');
        //构建NwBuilder对象
        const nw = new NwBuilder(config.build.nw.builder);
        //执行构建
        nw.build(err => {
            if (err) console.log(err);
            if (config.build.noSetup) return reject(new Error('No Setup Config'));
            resolve(manifest);
        });
    } else {
        reject(new Error('No Builder Plan'));
    }
}));
