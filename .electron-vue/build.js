'use strict';
process.env.NODE_ENV = 'production';
require('./utils').setMainEntry(process.env.BUILD_TARGET, 'production');
require('./nw/check-versions')();
const {say} = require('cfonts');
const chalk = require('chalk');
const del = require('del');
const webpack = require('webpack');
const Multispinner = require('multispinner');
const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');
const webConfig = require('./webpack.web.config');
const nwProdConfig = require('./nw/webpack.prod.conf');
const doneLog = chalk.bgGreen.white(' DONE ') + ' ';
const errorLog = chalk.bgRed.white(' ERROR ') + ' ';
const okayLog = chalk.bgBlue.white(' OKAY ') + ' ';

const isCI = process.env.CI || false;

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

function nw() {
    // if (config.build.onlyNW) return require('./build-nw.js');
    greeting();

    del.sync(['../dist/nw/*', '!.gitkeep']);

    const tasks = ['renderer'];
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
            return require('./build-nw');
        })
        .catch(err => {
            m.error('renderer');
            console.log(`\n  ${errorLog}failed to build renderer process`);
            console.error(`\n${err}\n`);
            process.exit(1);
        })
        .then(manifest => require('./nw/build-upgrade')(manifest))
        .catch(err => {
            m.error('renderer');
            console.log(`\n  ${errorLog}failed to build build-nw process`);
            console.error(`\n${err}\n`);
            process.exit(1);
        })
        .catch(err => {
            m.error('renderer');
            console.log(`\n  ${errorLog}failed to build build-upgrade process`);
            console.error(`\n${err}\n`);
            process.exit(1);
        });
}

function clean() {
    del.sync(['build/*', '!build/icons', '!build/icons/icon.*']);
    console.log(`\n${doneLog}\n`);

    process.exit();
}

function build() {
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
}

function electron() {
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
        process.exit();
    });

    pack(mainConfig)
        .then(result => {
            results += result + '\n\n';
            m.success('main');
        })
        .catch(err => {
            m.error('main');
            console.log(`\n  ${errorLog}failed to build main process`);
            console.error(`\n${err}\n`);
            process.exit(1);
        });

    pack(rendererConfig)
        .then(result => {
            results += result + '\n\n';
            m.success('renderer');
        })
        .catch(err => {
            m.error('renderer');
            console.log(`\n  ${errorLog}failed to build renderer process`);
            console.error(`\n${err}\n`);
            process.exit(1);
        });
}

function pack(config) {
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
}

function web() {
    del.sync(['dist/web/*', '!.gitkeep']);
    webpack(webConfig, (err, stats) => {
        if (err || stats.hasErrors()) console.log(err);

        console.log(stats.toString({
            chunks: false,
            colors: true
        }));

        process.exit();
    })
}

function greeting() {
    const cols = process.stdout.columns;
    let text = '';

    if (cols > 85) text = 'lets-build';
    else if (cols > 60) text = 'lets-|build';
    else text = false;

    if (text && !isCI) {
        say(text, {
            colors: ['yellow'],
            font: 'simple3d',
            space: false
        });
    } else console.log(chalk.yellow.bold('\n  lets-build'));
}
