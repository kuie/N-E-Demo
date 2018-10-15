<template>
    <div class="layout">
        <Layout :style="{minHeight: '100vh'}">
            <Sider :width="240" collapsible :collapsed-width="78" v-model="isCollapsed">
                <main-nav :is-collapsed="isCollapsed"></main-nav>
            </Sider>
            <Layout>
                <title-bar :style="{background: '#fff', boxShadow: '0 2px 3px 2px rgba(0,0,0,.1)'}"/>
                <Content :style="{padding: '0 16px 16px'}">
                    <app-main/>
                </Content>
            </Layout>
        </Layout>
    </div>
</template>

<script>
	import AppMain from './AppMain';
	import titleBar from './titleBar';
	import mainNav from './mainNav';

	export default {
		name: 'layout',
		components: {
			AppMain,
			titleBar,
			mainNav
		},
		data() {
			return {
				isCollapsed: false
			};
		}
	}
</script>

<style scoped lang="scss">
    .mainBar {
        height: 100vh;
    }

    .navBar {
        height: 25px;
    }

    .layout-con {
        height: 100%;
        width: 100%;
    }
</style>
