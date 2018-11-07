const path = require('path');
const utils = require('../utils');
const config = require('./config');
const vueLoaderConfig = require('../vue-loader.conf');

// const ExtractTextPlugin = require('extract-text-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

const src = resolve(path.join('..', 'src', 'renderer'));
module.exports = {
    entry: {
        app: './src/renderer/main.js'
    },
    output: {
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath: config[process.env.NODE_ENV === 'production' ? 'build' : 'dev'].assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.css'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': src,
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: [/node_modules/, resolve('../src/main/')]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('imgs/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },
    target: 'node-webkit'
};
