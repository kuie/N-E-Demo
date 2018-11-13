const path = require('path');
const utils = require('../utils');
const webpack = require('webpack');
const config = require('./config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const nodeModulesPath = path.join(__dirname, '../../node_modules');
const nodeModulesPathReg = new RegExp(`^${nodeModulesPath.replace(/\\/g, '\\\\')}.*\\.js$`);
const env = config.build.env;

const webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true
        })
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('[name].js',),
        chunkFilename: utils.assetsPath('[id].js',),
    },
    plugins: [
        //环境变量控制
        new webpack.DefinePlugin({
            'process.env': env
        }),
        //样式文件抽离
        new ExtractTextPlugin({
            filename: utils.assetsPath('[name].css')
        }),
        //样式文件压缩
        new OptimizeCSSPlugin(),
        // 构建index.html文件
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../../index.html'),
            //注入js脚本连接
            inject: true,
            //压缩控制
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency',
            //不引入main.js 主进程启动入口仅供nw.js启动主进程
            excludeChunks: ['main']
        }),
        // 拆分 node_modules下的文件
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: (module, count) => nodeModulesPathReg.test(module.resource)
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),
        // 静态资源拷贝
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '../../static'),
                to: path.join(__dirname, '../../dist/nw/static'),
                ignore: ['.*']
            }
        ]),
        //压缩js
        new webpack.optimize.UglifyJsPlugin({
            exclude: ['vendor'],
            sourceMap: true
        })
    ]
});

if (config.build.productionGzip) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin');

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig;
