# Electron & NW & Vue Demo

> An project can build Electron/NW/Web application

#### Build Setup

``` bash
# install dependencies
yarn

# electron mode serve with hot reload at localhost:9080
yarn run dev:electron

# node-webkit mode serve with hot reload at localhost:9080
yarn run dev:nw

# build electron application for production
yarn run build:electron
build
# 建议全局安装electron-builder

# build node-webkit application for production
yarn run build:nw


```

# About package version

[webpack:^3.12.0] 基于Webpack 3+

[babel-loader:^7.1.5](https://www.npmjs.com/package/babel-loader)

[webpack-dev-server:^2.11.3] 版本高于3 会在electron dev模式下报错


# About nwjs download TimeOut

安装依赖包的时候时间超长,建议建立一个本地静态资源服务器

PS：路径可自定义，但是后面的v必须要有

路径格式：http://$yourDomain$/$path$/v$yourNW.jsVersion$/$fileName$

### npm

修改 npm 的 .npmrc 文件

添加如下内容

````
nwjs_urlbase=http://localhost/nwjs/v
````


### yarn

修改 yarn 的 .yarnrc 文件

添加如下内容

````
nwjs_urlbase "http://localhost/nwjs/v"
````
---

添加electron 安装支持 指定electron 包的安装地址
详细内容请参看[electron 科学安装](https://www.jianshu.com/p/098fa716581e)