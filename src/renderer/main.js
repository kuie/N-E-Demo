import Vue from 'vue'
import {getID} from "./utils/auth";
import 'iview/dist/styles/iview.css';
import iView from 'iview'
import App from './App'
import router, {routers} from './router'
import store from './store'
import db from './utils/DB';

Vue.config.productionTip = false;
if (process.env.PLAY_MODE === 'nw') {
    require('./utils/update').checkUpdate();
    require('../nodeAPI/nw_api/init.js');
}

Vue.use(iView, {transfer: true});
Vue.use(db);

let unLoginWhiteList = ['/login'];
router.beforeEach((to, from, next) => {
    //为什么要有这个正则？从第一个页面跳转后请求会在to.poth后面多一个/
    if (!getID()) {
        let uuid = location.search.replace(/.*\buuid\b=([0-9a-zA-Z-]+).*/, '$1');
        sessionStorage.setItem('uuid', uuid);
        if (unLoginWhiteList.indexOf(to.path) !== -1) {
            next();
        } else {
            next('/login');
        }
    } else if (to.path === '/login') {
        /*修改路由*/
        next('/home');
    } else {
        router.addRoutes(routers);
        if (to.path === '/') {
            next('/home');
        }
        next()

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
