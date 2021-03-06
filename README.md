# Electron & NW & Vue Demo

> An project can build Electron/NW/Web application

#### Build Setup

不能直接使用yarn 安装 依赖 因为兼容nw 模式的同时package.json中会有两种模式下的全部依赖包、

为了缩小两种模式下的构建出的可执行文件体积安装依赖包的时候需要 全部安装 但在打包或调试时不需要全部引用
package.json也是通过脚本动态生成的

``` bash
# install dependencies
yarn run installModules

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

# 遇到的一些问题和尝试解决的方式

### Q: 实现多窗口登陆功能并可以通过任务栏图标右键管理

#### 整体思路：

多窗口登陆多账户 本地主进程生成UUID后分配给渲染进程

渲染进程在session中保持uuid 与主进程交互时使用uuid作为窗口唯一凭证


#### electron：

在electron 模式下 通过主进程进行数据集权及并通过 ipcRenderer ipcMain 实现与子进程交互，很容易就可以解决多窗口的问题

#### nwjs:

在nwjs 0.13 版本前因为没有主进程的概念 所以使用一个透明窗口作为不可被刷新的浏览器窗口执行主进程功能

在0.13 版本后 nwjs支持使用.js 文件作为入口

其实通过chrome.runtime的postMessage 并进行一定程度的封装可以实现点对点通信（广播订阅模式，类似路由器通过mac地址寻找主机）实现窗口信息分布式同步更新管理的方式

但经过实际测试后放弃了原本希望通过分布式管理并实时更新的方案

原因是nwjs 生成Tray (任务栏图标)跟第一个打开的窗口（主窗口，下同）绑定，命名空间共享，但在主窗口刷新后 Tray 绑定的操作及变量就全部失效了

因此不能完全通过这种分布式管理的方式进行控制

因为窗口如果存在就不能解决被刷新的问题

#### 关于自动更新
在网上看了很多更新的例子 但发现都是通过autoUpdate下载安装包进行更新

但我发现直接将构建后的xxx-unpackage文件夹里的文件复制到安装目录其实就实现了更新

正在尝试通过打包完毕后生成全部文件的hashMao实现增量更新
提高用户体验
但这种增量更新不容易抽离成公共方法
对于项目的针对性较高
也许不适合作为插件或单独成为项目