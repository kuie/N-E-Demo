'use strict';
process.env.NODE_ENV = 'production';
require('./utils').setMainEntry(process.env.BUILD_TARGET, 'production');
//版本检查 关联 package.json 的engines
require('./nw/check-versions')();
const path = require('path');
const exec = require('child_process').exec;
const chalk = require('chalk');
const del = require('del');
const webpack = require('webpack');
const electronBuilder = require('electron-builder');
//特效文字
const {say} = require('cfonts');
//多任务展示
const Multispinner = require('multispinner');
const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');
const webConfig = require('./webpack.web.config');
const nwProdConfig = require('./nw/webpack.prod.conf');
const doneLog = chalk.bgGreen.white(' DONE ') + ' ';
const errorLog = chalk.bgRed.white(' ERROR ') + ' ';
const okayLog = chalk.bgBlue.white(' OKAY ') + ' ';
const isCI = process.env.CI || false;
const nw = () => {
    greeting();
    del.sync(['../dist/nw/*', '!.gitkeep']);
    const tasks = ['renderer', 'build-win-setup'];
    const m = new Multispinner(tasks, {
        preText: 'building',
        postText: 'process'
    });
    let results = '';
    m.on('success', _ => {
        process.stdout.write('\x1B[2J\x1B[0f');
        console.log(`\n\n${results}`);
        console.log(`${okayLog}\n`);
    });
    pack(nwProdConfig)
        .then(result => {
            results += result + '\n\n';
            m.success('renderer', '测试一下');
            return require('./nw/build-nw');
        })
        .catch(err => m.error('renderer'))
        .then(mainConfig => require('./nw/build-win-setup.js')().then(() => {
            m.success('build-win-setup');
            return Promise.resolve(mainConfig);
        }))
        .then(manifest => require('./nw/build-upgrade')(manifest))
        .catch(err => m.error('build-win-setup'));
};
const clean = () => {
    del.sync(['build/*', '!build/icons', '!build/icons/icon.*']);
    console.log(`\n${doneLog}\n`);
    process.exit();
};
const build = () => {
    greeting();

    del.sync(['dist/base/*', '!.gitkeep']);

    const tasks = ['main', 'renderer'];
    const m = new Multispinner(tasks, {
        preText: 'building',
        postText: 'process'
    });

    let results = '';

    m.on('success', () => {
        process.stdout.write('\x1B[2J\x1B[0f');
        console.log(`\n\n${results}`);
        process.exit();
    });

    pack(mainConfig).then(result => {
        results += result + '\n\n';
        m.success('main');
    }).catch(err => {
        m.error('main');
        console.log(`\n  ${errorLog}failed to build main process`);
        console.error(`\n${err}\n`);
        process.exit(1);
    });

    pack(rendererConfig).then(result => {
        results += result + '\n\n';
        m.success('renderer');
    }).catch(err => {
        m.error('renderer');
        console.log(`\n  ${errorLog}failed to build renderer process`);
        console.error(`\n${err}\n`);
        process.exit(1);
    });
};
const electron = () => {
    greeting();

    del.sync(['dist/electron/*', '!.gitkeep']);

    const tasks = ['main', 'renderer'];
    const m = new Multispinner(tasks, {
        preText: 'building',
        postText: 'process'
    });

    let results = '';

    m.on('success', () => {
        process.stdout.write('\x1B[2J\x1B[0f');
        console.log(`\n\n${results}`);
    });
    let main = new Promise((resolve, reject) => {
        pack(mainConfig)
            .then(result => {
                results += result + '\n\n';
                m.success('main');
                resolve();
            })
            .catch(err => {
                m.error('main');
                console.log(`\n  ${errorLog}failed to build main process`);
                console.error(`\n${err}\n`);
                process.exit(1);
                reject();
            })
            .finally(() => del([path.resolve(__dirname, '../dist/package.json')]));
    });
    let renderer = new Promise((resolve, reject) => {
        pack(rendererConfig)
            .then(result => {
                results += result + '\n\n';
                m.success('renderer');
                resolve();
            })
            .catch(err => {
                m.error('renderer');
                console.log(`\n  ${errorLog}failed to build renderer process`);
                console.error(`\n${err}\n`);
                process.exit(1);
                reject();
            });
    });
    Promise.all([main, renderer]).then(res => {
        electronBuilder.build({
            config: {
                "productName": "evt1",
                "appId": "club.kuie.www",
                "directories": {
                    "output": path.resolve(__dirname, "../build/electron/v${version}/${os}/")
                },
                "nsis": {
                    "oneClick": false,
                    "allowElevation": false,
                    "allowToChangeInstallationDirectory": true,
                    "installerIcon": path.resolve(__dirname, "../build/icons/icon.ico"),
                    "uninstallerIcon": path.resolve(__dirname, "../build/icons/icon.ico"),
                    "installerHeaderIcon": path.resolve(__dirname, "../build/icons/icon.ico"),
                    "createDesktopShortcut": true,
                    "createStartMenuShortcut": true,
                    "shortcutName": "通宝Demo"
                },
                "copyright": "www.qudao.com",
                "files": [
                    "./**/*",
                    "!/0.js",
                    "!./package.json",
                    "!./package-lock.json",
                    "!./electron-builder.json"
                ],
                "dmg": {
                    "contents": [
                        {
                            "x": 410,
                            "y": 150,
                            "type": "link",
                            "path": "/Applications"
                        },
                        {
                            "x": 130,
                            "y": 150,
                            "type": "file"
                        }
                    ]
                },
                "win": {
                    "icon": path.resolve(__dirname, "../build/icons/icon.ico",),
                    "target": [
                        {
                            "target": "nsis",
                            "arch": [
                                "ia32"
                            ]
                        }
                    ]
                },
                "mac": {
                    "icon": path.resolve(__dirname, "../build/icons/icon.icns"),
                },
                "linux": {
                    "icon": path.resolve(__dirname, "../build/icons")
                }
            }
        }).then(() => {
            exec('node "./update/electron.js"', (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                console.log(stdout);
            });
        }).catch(e => console.log(e));
    });
};
const pack = config => {
    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {

            if (err) reject(err.stack || err);
            else if (stats.hasErrors()) {
                let err = '';

                stats
                    .toString({
                        chunks: false,
                        colors: true
                    })
                    .split(/\r?\n/)
                    .forEach(line => {
                        err += `    ${line}\n`
                    });

                reject(err)
            } else {
                resolve(stats.toString({
                    chunks: false,
                    colors: true
                }));
            }
        })
    })
};
const web = () => {
    del.sync(['dist/web/*', '!.gitkeep']);
    webpack(webConfig, (err, stats) => {
        if (err || stats.hasErrors()) console.log(err);

        console.log(stats.toString({
            chunks: false,
            colors: true
        }));

        process.exit();
    })
};
const greeting = () => {
    const cols = process.stdout.columns;
    let text = '';
    if (cols > 85) text = 'node-webkit';
    else if (cols > 60) text = 'node-webkit';
    else text = false;
    if (text && !isCI) say(text, {colors: ['yellow'], font: 'simple3d', space: false});
    else console.log(chalk.yellow.bold('\n  node-webkit Build'));
};

switch (process.env.BUILD_TARGET) {
    case 'clean':
        return clean();
    case 'web':
        return web();
    case 'nw':
        return nw();
    case 'electron':
        return electron();
    default:
        return build();
}