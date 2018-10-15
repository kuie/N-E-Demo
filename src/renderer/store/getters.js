import { getToken } from "../utils/auth";
import store from './index';

const getters = {
	name: state => state.user.name,
	roles: state => state.user.roles,
	identity: state => state.user.identity,
	id: state => state.user.id,
	token: state => {
		if (!state.user.token) {
			store.commit('SET_TOKEN', getToken());
			// state.user.token = getToken();
		}
		return state.user.token
	},
	routers: state => state.permission.addRouters
};
export default getters;
