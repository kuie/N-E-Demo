import fetch from '../utils/fetch'

//登陆
export function login(username, password) {
	return fetch({
		url: 'login',
		method: 'post',
		data: { username, password }
	});
}

//注册
export function register(obj) {
	return fetch({
		url: 'register',
		method: 'post',
		data: obj
	});
}

//获取用户权限
export function getRoles(accountId) {
	return fetch({
		url: 'getRoles',
		method: 'post',
		data: { accountId }
	});
}
