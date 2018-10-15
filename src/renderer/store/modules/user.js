import {setID, setToken, removeCookie} from "../../utils/auth";
import {login, register} from "../../api/baseHandle";

const state = {
    id: '',
    identity: '',
    name: '',
    roles: [],
    token: ''
};

const mutations = {
    SET_NAME(state, name) {
        state.name = name;
    },
    SET_ID(state, id) {
        state.id = id;
    },
    SET_IDENTITY(state, identity) {
        state.identity = identity;
    },
    SET_ROLES(state, roles) {
        state.roles = roles;
    },
    SET_TOKEN: (state, token) => {
        state.token = token;
    }
};

const actions = {
    Login({commit}, userInfo) {
        const account = userInfo.username.trim();
        return new Promise((resolve, reject) => {
            login(account, userInfo.password).then(response => {
                const data = response.data;
                console.log(data);
                setID(data.id);
                setToken(data.token);
                commit('SET_ID', data.id);
                commit('SET_TOKEN', data.token);
                resolve();
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    },
    Register({commit}, userInfo) {
        userInfo.username = userInfo.username.trim();
        return new Promise((resolve, reject) => {
            register(userInfo).then(response => {
                if (response.code === 200) resolve();
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    },
    GetRoles({commit}, accountId) {
        return new Promise((resolve, reject) => {
            getRoles(accountId).then(response => {
                const data = response.data;
                setID(data.id);
                commit('SET_IDENTITY', data.identity);
                commit('SET_ID', data.id);
                commit('SET_NAME', data.operatorName);
                let role = data.resources;
                role.push('account');
                commit('SET_ROLES', role);
                resolve(response);
            }).catch(error => {
                console.log(error);
                if (error.code !== 50008 && error.code !== 50012 && error.code !== 50014) {
                    reject(error);
                }
            });
        });
    },
    LogOut({commit}) {
        return new Promise((resolve, reject) => {
            logout().then(() => {
                commit('SET_ROLES', []);
                removeCookie();
                resolve();
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    },
    FedLogOut({commit}) {
        return new Promise(resolve => {
            commit('SET_ROLES', []);
            removeCookie();
            resolve();
        });
    }
};

export default {
    state,
    mutations,
    actions
}
