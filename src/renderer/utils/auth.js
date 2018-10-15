import Cookies from 'js-cookie';

const TokenKey = 'Account-Token', IdKey = 'Account-Id';

export function getToken() {
	return Cookies.get(TokenKey);
}

export function setToken(token) {
	return Cookies.set(TokenKey, token);
}

export function getID() {
	return Cookies.get(IdKey);
}

export function setID(id) {
	return Cookies.set(IdKey, id);
}

export function removeCookie() {
	Cookies.remove(IdKey);
	Cookies.remove(TokenKey);
}