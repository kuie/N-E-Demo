import {removeCookie} from "../../utils/auth";
import {login} from "../../api/baseHandle";
import api from '../../../nodeAPI';
import {Message} from 'iview';

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
        /*读取已登录用户列表 确定用户是否已登陆*/
        let userList = sessionStorage.getItem('user_list');
        let accountReg = new RegExp(`"account" ?: ?"${account}"`, 'g');
        if (accountReg.test(userList)) return Promise.reject('该账号已登录');
        userList = userList ? JSON.parse(userList) : [];

        return new Promise((resolve, reject) => {
            login(account, userInfo.password).then(response => {
                const data = response.data;
                const token = data.token;
                const id = data.id;
                /*更新用户登陆列表*/
                if (api.searchLoginState(id)) return reject('账号已登录,请勿重复登陆');
                userList.push({account, token, id});
                sessionStorage.setItem('user_list', JSON.stringify(userList));
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
