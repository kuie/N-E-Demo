import Vue from 'vue'
import Router from 'vue-router'
import Layout from '../view/layout/layout'
import Empty from '../view/layout/empty'
import E404 from '../view/error/404'

const _vue = path => r => require.ensure([], () => r(require(`../view/pages/${path}.vue`)));
Vue.use(Router);

export const constantRouterMap = [
    {
        path: '/login',
        component: Empty,
        children: [{name: 'login', path: '', component: _vue('login/index')}],
        hidden: true
    },
    {path: '/404', component: E404, hidden: true}
];

export const routers = [
    {path: '/', redirect: '/home', hidden: true},
    // 首页
    {
        path: '/home',
        component: Layout,
        children: [
            {
                path: '',
                component: _vue('index'),
                meta: {title: '首页'},
            }
        ]
    },
    {path: '*', redirect: '/404'}
];

export default new Router({
    // mode: 'history', //后端支持可开
    scrollBehavior: () => ({y: 0}),
    routes: constantRouterMap
});
