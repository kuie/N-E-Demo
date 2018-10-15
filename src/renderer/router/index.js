import Vue from 'vue'
import Router from 'vue-router'
import Layout from '../view/layout/layout'
import Empty from '../view/layout/empty'

const _vue = path => r => require.ensure([], () => r(require(`../view/pages/${path}.vue`)));
Vue.use(Router);

export const constantRouterMap = [
	/*根据是否有欢迎页进行控制，如果没有欢迎页全部重定向到登陆页面*/
	// { path: '/', component: _vue('index'), hidden: true },
	{
		path: '/login',
		component: Empty,
		children: [{ name: 'login', path: '', component: _vue('login/index') }],
		hidden: true
	},
	{
		path: '/register',
		component: Empty,
		children: [{ name: 'register', path: '', component: _vue('register/index') }],
		hidden: true
	},
	{ path: '*', redirect: '/login' }
];

export const routers = [
	{
		path: '/',
		component: Layout,
		redirect: 'noredirect',
		children: [
			{
				path: '',
				component: _vue('index'),
				noDropdown: true,
				name: 'index',
				meta: { title: '首页', keepAlive: true },
			}
		]
	},
	{ path: '*', redirect: '/' }
];

export default new Router({
	// mode: 'history', //后端支持可开
	scrollBehavior: () => ({ y: 0 }),
	routes: constantRouterMap
});
