import Vue from 'vue'
import {getID} from "./utils/auth";
import 'iview/dist/styles/iview.css';
import iView from 'iview'
import App from './App'
import router from './router'
import store from './store'
import db from './utils/DB';

Vue.config.productionTip = false;
if (process.env.PLAY_MODE === 'nw') {
    const {checkUpdate} = require('./utils/update');
    checkUpdate();
}

Vue.use(iView, {transfer: true});
Vue.use(db);

let unLoginWhiteList = ['/login', '/register'];
let redirectList = [
    {path: '/baidu', redirect: 'https://www.baidu.com'}
];
router.beforeEach((to, from, next) => {
    //为什么要有这个正则？从第一个页面跳转后请求会在to.poth后面多一个/
    if (/.+\/$/.test(to.path)) {
        next(to.path.replace(/\/$/, ''));
    } else if (!getID()) {
        if (unLoginWhiteList.indexOf(to.path) !== -1) {
            next();
        } else {
            next('/login');
        }
    } else if (/\/\b(login|register)\b\/?/.test(to.path)) {
        /*修改路由*/
        next({path: '/'});
    } else if (store.state.user.roles.length === 0) {
        const userId = store.getters.id || getID();
        store.dispatch('GetRoles', userId).then(() => {
            const roles = store.getters.roles;
            const identity = store.getters.identity;
            store.dispatch('GenerateRoutes', {roles, identity}).then(() => {
                router.addRoutes(store.getters.routers);
                next(...to);
            });
        }).catch(() => {
            store.dispatch('FedLogOut');
            next('/login');
        });
    } else {
        /*todo 在这里添加针对重定向路由表的控制*/
        console.log(to.path);
        next();
    }
});

router.afterEach(() => {
});

new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app');
