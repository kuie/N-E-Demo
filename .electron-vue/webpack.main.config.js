'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const {dependencies} = require('../package.json')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');

const BabiliWebpackPlugin = require('babel-minify-webpack-plugin')
let whiteListedModules = ['asar'];
let externals = [...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))]
    .concat([...Object.keys(require('../config/package_nw').devDependencies || {})]);
let mainConfig = {
    entry: {
        main: path.join(__dirname, '../src/main/electron_entry.js')
    },
    externals,
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        extensions: ['.js', '.json', '.node']
    },
    target: 'electron-main'
};

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    mainConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env.PLAY_MODE': '"electron"',
            '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
        })
    )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    mainConfig.plugins.push(
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '../config/electron-builder.json'),
                to: path.join(__dirname, '../dist/electron/electron-builder.json')
            },
            {
                from: path.join(__dirname, '../dist/package.json'),
                to: path.join(__dirname, '../dist/electron/package.json')
            }
        ]),
        new BabiliWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env.PLAY_MODE': '"electron"',
            'process.env.NODE_ENV': '"production"'
        })
    )
}

module.exports = mainConfig;
