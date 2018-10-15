// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path');

function resolve() {
    return path.resolve.apply(path, [__dirname, '..'].concat(...arguments))
}

// `./package.json`
const tmpJson = require(resolve('../../package.json'));

// const curReleasesPath = resolve('../../dist/nw', tmpJson.name + '-v' + tmpJson.version)
const curReleasesPath = resolve('../../build/nw', tmpJson.version);
module.exports = {
    build: {
        env: {
            NODE_ENV: '"production"',
            PLAY_MODE: '"nw"'
        },
        index: resolve('../../dist/nw/index.html'),
        assetsRoot: resolve('../../dist/nw'),
        assetsSubDirectory: '',
        assetsPublicPath: '/',
        productionSourceMap: false,
        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],
        // Run the build command with an extra argument to
        // View the bundle analyzer report after build finishes:
        // `npm run build --report`
        // Set to `true` or `false` to always turn it on or off
        bundleAnalyzerReport: process.env.npm_config_report,
        // only build nw
        onlyNW: process.env.npm_config_onlyNW,
        // only build nw
        noSetup: process.env.npm_config_noSetup,
        nw: {
            // see document: https://github.com/nwjs/nw-builder
            /*builder 默认设置*/
            /*builderDefault: {
                files: null,
                appName: false,
                appVersion: false,
                platforms: ['osx64', 'win32', 'win64'],
                currentPlatform: detectCurrentPlatform(),
                version: 'latest',
                buildDir: './build',
                cacheDir: './cache',
                downloadUrl: 'https://dl.nwjs.io/',
                manifestUrl: 'https://nwjs.io/versions.json',
                flavor: 'sdk',
                buildType: 'default',
                forceDownload: false,
                macCredits: false,
                macIcns: false,
                macZip: null,
                zip: null,
                zipOptions: null,
                macPlist: false,
                winVersionString: {},
                winIco: null,
                argv: process.argv.slice(2)
            },*/

            builder: {
                files: [resolve('../../dist/nw/**')],
                platforms: ['win32', 'win64'],
                version: '0.14.7',
                flavor: 'normal',
                downloadUrl: 'http://localhost/nwjs/',//指定下载nwjs打包依赖文件的服务器地址
                cacheDir: resolve('../../node_modules/_nw-builder-cache/'),
                buildDir: resolve('../../build/nw'),
                winIco: resolve('../../build/icons/logo.ico'),
                macIcns: resolve('../../build/icons/logo.icns'),
                buildType: function () {
                    return this.appVersion
                }
            },
            setup: {
                issPath: resolve('./config/setup.iss'),
                // only one version path
                files: curReleasesPath,
                resourcesPath: resolve('../../build/icons'),
                appPublisher: 'vue-nw-seed, Inc.',
                appURL: 'https://github.com/anchengjian/vue-nw-seed',
                appId: '{{A448363D-3A2F-4800-B62D-8A1C4D8F1115}}',
                // data: { name, version, platform }
                outputFileName: function (data) {
                    return data.name + '-' + data.version
                }
            },
            upgrade: {
                outputFile: resolve('../../build/nw/upgrade.json'),
                publicPath: 'http://localhost:8080/build/nw/',
                files: [curReleasesPath]
            }
        }
    },
    dev: {
        env: {
            NODE_ENV: '"development"',
            PLAY_MODE: '"nw"'
        },
        port: 8080,
        autoOpenBrowser: true,
        assetsSubDirectory: '',
        assetsPublicPath: '/',
        proxyTable: {},
        // CSS Sourcemaps off by default because relative paths are "buggy"
        // with this option, according to the CSS-Loader README
        // (https://github.com/webpack/css-loader#sourcemaps)
        // In our experience, they generally work as expected,
        // just be aware of this issue when enabling this option.
        cssSourceMap: true,
        upgrade: {
            publicPath: '/build',
            directory: 'build'
        }
    }
};
