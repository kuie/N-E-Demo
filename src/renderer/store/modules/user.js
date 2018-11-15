import {removeCookie, setCookie, setID, setToken} from "../../utils/auth";
import {login} from "../../api/baseHandle";

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
                const token = data.token;
                const id = data.id;
                const username = data.username;
                setID(id);
                setToken(token);
                setCookie('username', username);
                resolve(data);
            }).catch(error => {
                reject(error);
            });
        });
    },
    FedLogOut({commit}) {
        return new Promise(resolve => {
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
