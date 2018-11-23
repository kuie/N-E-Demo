<template>
    <div>
        <h1>这里是登陆后的主页</h1>
        <hr>
        <h2>很明显我懒得画了...</h2>
        <hr>
        <h3>准备写入自动更新了~</h3>
        <hr>
        <h3>我再更新一下</h3>
        <p>Version:{{appVersion}}</p>
        <p>home:{{appPath.home}}</p>
        <p>appData:{{appPath.appData}}</p>
        <p>userData:{{appPath.userData}}</p>
        <p>temp:{{appPath.temp}}</p>
        <p>exe:{{appPath.exe}}</p>
        <p>module:{{appPath.module}}</p>
        <p>desktop:{{appPath.desktop}}</p>
    </div>
</template>

<script>
    const {app} = require('electron');

    export default {
        name: 'index',
        created() {
            this.appPath.home = app.getPath('home');
            this.appPath.appData = app.getPath('appData');
            this.appPath.userData = app.getPath('userData');
            this.appPath.temp = app.getPath('temp');
            this.appPath.exe = app.getPath('exe');
            this.appPath.module = app.getPath('module');
            this.appPath.desktop = app.getPath('desktop');
            this.appVersion = app.getVersion();
        },
        data() {
            return {
                appPath: {
                    home: 'no',
                    appData: 'no',
                    userData: 'no',
                    temp: 'no',
                    exe: 'no',
                    module: 'no',
                    desktop: 'no'
                },
                appVersion: 1
            }
        }
    }
</script>

<style scoped>

</style>
