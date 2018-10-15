const http = require('http');
import axios from 'axios';
import {Message, Modal} from 'iview';
import store from '../store';
import qs from 'qs';

// 创建axios实例
const service = axios.create({
    withCredentials: true, // 上传cookie
    baseURL: 'http://localhost:10000/mock/5ba04ffb6a6fc725949f24ef', //mock
    // baseURL: 'http://localhost:3000/electron', // koa2
    timeout: 30 * 1000// 请求超时时间
});

const sendInterceptors = config => {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    store.getters.token && (config.headers['Authorization'] = `Bearer ${store.getters.token}`);
    config.url = config.url + '?_timestamp=' + Date.now();
    config.data = qs.stringify(config.data);
    return config;
};
const sendError = error => {
    // Do something with request error
    console.log(error); // for debug
    Message.error({content: '请求错误！', duration: 5});
    Promise.reject(error);
};


// request拦截器
service.interceptors.request.use(sendInterceptors, sendError);

// respone拦截器
service.interceptors.response.use(response => {
    if (response.status !== 200) {
        console.log(response);// for debug
        Message.error({content: '返回错误！', duration: 5});
        return Promise.reject(response);
    }

    const res = response.data;
    if (res.code === null || res.code === undefined) {
        // 非标准格式数据
        console.log(response);// for debug
        return response.data;
    }

    if (res.code !== 200) {
        console.log(response);// for debug
        // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
        if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
            Modal.confirm({
                title: '异常状态',
                content: `<p>${res.msg}您可以取消继续留在该页面，或者重新登录, 确定登出</p>`,
                okText: '重新登陆',
                cancelText: '取消',
                onOk: () => {
                    store.dispatch('FedLogOut').then(() => {
                        location.reload();// 为了重新实例化vue-router对象 避免bug
                    });
                },
                onCancel: () => {
                    console.log(error);
                }
            });
        } else {
            Message.error({content: res.msg, duration: 5});
        }
        return Promise.reject(response.data);
    }
    return response.data;
}, error => {
    console.log(error);// for debug
    Message.error({content: '返回错误！', duration: 5});
    return Promise.reject(error);
});
export default service;

export const net = (config = {
    url: 'register',
    method: 'post',
    data: obj
}) => {
    config = sendInterceptors(config);
    http[config.method](config.url, function (res) {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {

        })
    })
};