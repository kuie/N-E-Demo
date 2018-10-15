import { routers, constantRouterMap } from "../../router";

const hasPermission = (roles, route) => {
	if (route.meta && route.meta.role) {
		return roles.some(role => route.meta.role.indexOf(role) >= 0);
	} else {
		return true;
	}
};

const filterAsyncRouter = (asyncRouterMap, roles) => {
	return asyncRouterMap.filter(route => {
		if (hasPermission(roles, route)) {
			if (route.children && route.children.length) {
				route.children = filterAsyncRouter(route.children, roles);
			}
			return true;
		}
		return false;
	});
};

const state = {
	routers: [],
	addRouters: []
};

const mutations = {
	SET_ROUTERS(state, routers) {
		state.addRouters = routers;
		state.routers = constantRouterMap.concat(routers);
	}
};

const actions = {
	GenerateRoutes({ commit }, data) {
		return new Promise(resolve => {
			const { roles, identity } = data;
			//身份判别可放在这里
			commit('SET_ROUTERS', filterAsyncRouter(routers, roles));
			resolve();
		});
	}
};

export default {
	state,
	mutations,
	actions
}
