const path = require('path');
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const wConfig = require('./buildConfig').nw.window;

exports.assetsPath = function (_path) {
    const assetsSubDirectory = process.env.NODE_ENV === 'production' ? './' : '../../';
    return path.posix.join(assetsSubDirectory, _path);
};

exports.cssLoaders = function (options = {}) {
    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: process.env.NODE_ENV === 'production',
            sourceMap: options.sourceMap
        }
    };

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        const loaders = [cssLoader];
        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            });
        }

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            });
        } else {
            return ['vue-style-loader'].concat(loaders);
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {indentedSyntax: true}),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
    const output = [];
    const loaders = exports.cssLoaders(options);
    for (const extension in loaders) {
        const loader = loaders[extension];
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        });
    }
    return output;
};

exports.setMainEntry = function (type, mode) {
    if (!/^(nw|electron|web)$/.test(type)) return false;
    fs.writeFileSync(path.resolve('src', 'nodeApi', 'index.js'), `import api from './${type}_api';export default {install(Vue) {Vue.prototype.$api = api;}};`, 'utf-8');
    const packagePath = path.resolve('./', 'package.json'),
        basePackagePath = path.resolve('./', 'config', 'package_base.json'),
        baseJson = require(basePackagePath),
        targetJson = require(path.resolve('./', 'config', `package_${type}.json`));
    targetJson.dependencies = Object.assign(baseJson.dependencies, targetJson.dependencies);
    targetJson.devDependencies = Object.assign(baseJson.devDependencies, targetJson.devDependencies);
    const json = Object.assign(baseJson, targetJson);
    if (type === 'nw') {
        json.window = wConfig;
    } else if (type === 'electron') {
        /*这里的package.json 放置在dist/electron/文件夹下*/
        const typePackage = {
            name: json.name,
            version: json.version,
            author: json.author,
            description: json.description,
            main: `./main.js`,
            devDependencies: {
                electron: json.devDependencies.electron
            }
        };
        const typePackagePath = path.resolve('./', 'dist', 'package.json');
        fs.writeFileSync(typePackagePath, JSON.stringify(typePackage, null, '  '), 'utf-8');
    }
    fs.writeFileSync(packagePath, JSON.stringify(json, null, '  '), 'utf-8');
};