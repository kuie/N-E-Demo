<template>
    <Layout :style="{minHeight: '100vh'}">
        <title-bar :style="{background: '#fff', boxShadow: '0 2px 3px 2px rgba(0,0,0,.1)'}"/>
        <Content :style="{padding: '30px'}">
            <app-main/>
        </Content>
    </Layout>
</template>

<script>
	import AppMain from './AppMain';
	import titleBar from './titleBar';

	export default {
		name: 'empty',
		components: { AppMain, titleBar }
	}
</script>

<style scoped>

</style>
