<template>
    <div class="titleBarBox">
        <span>操作系统:{{platform}}</span>
        <span>访问路径:{{$route.path}}</span>
        <div class="controlBtnGroup">
            <title-btn type="min"/>
            <title-btn type="max"/>
            <title-btn type="close"/>
        </div>
    </div>
</template>

<script>
	import titleBtn from './titleBtn';
	import os from 'os';

	export default {
		name: 'title-bar',
		components: { titleBtn },
		data() {
			return {
				platform: os.platform()
			}
		},
	}
</script>

<style scoped lang="scss">
    .titleBarBox {
        display: block;
        position: relative;
        overflow: hidden;
        min-height: 26px;
        -webkit-app-region: drag;
        .controlBtnGroup {
            float: right;
            background: firebrick;
        }
    }
</style>
