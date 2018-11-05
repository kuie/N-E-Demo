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
}
let isPushRouter = false;
Vue.use(iView, {transfer: true});
Vue.use(db);

let unLoginWhiteList = ['/login'];
router.beforeEach((to, from, next) => {
    console.log(to.path);
    if (!getID()) {
        if (unLoginWhiteList.indexOf(to.path) !== -1) {
            next();
        } else {
            next('/login');
        }
    } else if (to.path === '/login') {
        next('/home');
    } else {
        to.path === '/' && next('/home');
        if (!isPushRouter) {
            router.addRoutes(routers);
            isPushRouter = true;
            next({...to});
        } else {
            next();
        }
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
