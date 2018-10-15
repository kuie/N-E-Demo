<template>
    <Menu theme="primary" :open-names="['1']" accordion>
        <Submenu name="1">
            <template slot="title">
                <Icon type="ios-paper"/>
                内容管理
            </template>
            <MenuItem name="1-1">文章管理</MenuItem>
            <MenuItem name="1-2">评论管理</MenuItem>
            <MenuItem name="1-3">举报管理</MenuItem>
        </Submenu>
    </Menu>
</template>

<script>
	import { mapGetters } from 'vuex';

	export default {
		props: {
			isCollapsed: {
				type: Boolean
			}
		},
		name: 'manNav',
		created() {
			console.log(this.$route);
			console.log(mapGetters(['permission_routers']))

		},
		computed: {
			menuitemClasses() {
				return [
					'menu-item',
					this.isCollapsed ? 'collapsed-menu' : ''
				]
			}
		}
	}
</script>

<style scoped>
    .menu-item span {
        display: inline-block;
        overflow: hidden;
        width: 69px;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: bottom;
        transition: width .2s ease .2s;
    }

    .menu-item i {
        transform: translateX(0px);
        transition: font-size .2s ease, transform .2s ease;
        vertical-align: middle;
        font-size: 16px;
    }

    .collapsed-menu span {
        width: 0;
        transition: width .2s ease;
    }

    .collapsed-menu i {
        transform: translateX(5px);
        transition: font-size .2s ease .2s, transform .2s ease .2s;
        vertical-align: middle;
        font-size: 22px;
    }
</style>
