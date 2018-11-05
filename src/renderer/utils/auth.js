import Cookies from 'js-cookie';

const TokenKey = 'Account-Token', IdKey = 'Account-Id';

export const getToken = _ => sessionStorage.getItem(TokenKey);

export const setToken = token => sessionStorage.setItem(TokenKey, token);

export const getID = _ => sessionStorage.getItem(IdKey);

export const setID = id => sessionStorage.setItem(IdKey, id);

export const setCookie = (key, val) => sessionStorage.setItem(key, val);

export const getCookie = key => sessionStorage.getItem(key);

export function removeCookie() {
    // Cookies.remove(IdKey);
    // Cookies.remove(TokenKey);
}