const http = require('http');
const path = require('path');
import axios from 'axios';
import {Message, Modal} from 'iview';
import store from '../store';
import qs from 'qs';

const baseConfig = {
    withCredentials: true, // 上传cookie
    // baseURL: 'http://localhost:10000/mock/5ba04ffb6a6fc725949f24ef', //mock
    // baseURL: 'http://localhost:3000/electron', // koa2
    baseURL: 'http://106.12.100.234:10005/mock/5bc45f7c8ebc42193f2615cf', // 106.12.100.234
    timeout: 30 * 1000// 请求超时时间
};

// 创建axios实例
const service = axios.create(baseConfig);

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
const baseUrlParse = url => {
    return {
        hostname: url.replace(/^https?:\/\/((([a-zA-Z0-9_-])+(\.)?)*).*/i, '$1'),
        port: url.replace(/.*:(\d+).*/, '$1'),
        path: url.replace(/^https?:\/\/((([a-zA-Z0-9_-])+(\.)?)*)(:\d+)?/i, '') + '/',
    }
};
export const net = config => {
    const postData = qs.stringify(config.data);
    const url = baseUrlParse(baseConfig.baseURL);
    let options = {
        hostname: url.hostname,
        port: url.port,
        path: url.path + config.url.replace(/^\//, '') + '?_timestamp=' + Date.now(),
        method: config.method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    return new Promise((resolve, reject) => {
        let req = http.request(options, function (res) {
            res.setEncoding('utf8');
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', _ => {
                data = JSON.parse(data);
                if (data.code !== 200) {
                    console.log(data);// for debug
                    // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
                    if (data.code === 50008 || data.code === 50012 || data.code === 50014) {
                        Modal.confirm({
                            title: '异常状态',
                            content: `<p>${data.msg}您可以取消继续留在该页面，或者重新登录, 确定登出</p>`,
                            okText: '重新登陆',
                            cancelText: '取消',
                            onOk: () => {
                                store.dispatch('FedLogOut').then(() => {
                                    location.reload();// 为了重新实例化vue-router对象 避免bug
                                });
                            },
                            onCancel: () => console.log(error)
                        });
                    } else {
                        Message.error({content: data.msg, duration: 5});
                    }
                    resolve(data);
                }
            });
            res.on('error', e => reject(e))
        });
        req.write(postData);
        req.end();
    });
};

export default net;