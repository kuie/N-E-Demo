const path = require('path');
const fs = require('fs');
const manifest = require('./buildConfig').nw;
const config = require('./nw/config');

const manifestPath = path.resolve(config.build.assetsRoot, 'package.json');

module.exports = new Promise((resolve, reject) => {
    fs.writeFile(manifestPath, JSON.stringify(manifest, null, '  '), 'utf-8', function (err) {
        if (err) reject(err);
        // start build app
        if (config.build.nw.builder) {
            const NwBuilder = require('nw-builder');
            const nw = new NwBuilder(config.build.nw.builder);
            nw.build(function (err, data) {
                if (err) console.log(err);
                // build windows setup
                if (config.build.noSetup) return reject(new Error('No Setup Config'));
                if (~config.build.nw.builder.platforms.toString().indexOf('win')) {
                    require('./nw/build-win-setup.js')()
                        .then(_ => resolve(manifest))
                        .catch(e => console.log(e));
                } else {
                    resolve(manifest);
                }
            })
        } else {
            reject(new Error('No Builder Plan'));
        }
    })
});
