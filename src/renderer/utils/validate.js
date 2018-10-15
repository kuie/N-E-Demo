export function validateUserName(userName) {
	if (userName.trim().length < 1) {
		return { success: false, message: '用户名不能为空！' };
	}
	return { success: true, message: '' };
}

export function validatePassword(password) {
	const length = password.length;
	if (!length) {
		return { success: false, message: '密码不能为空！' };
	} else if (length < 6) {
		return { success: false, message: '密码不能少于6位！' };
	} else if (length > 16) {
		return { success: false, message: '密码不能大于16位！' };
	} else {
		if (/[a-zA-Z]+/.test(password)) {
			if (/[0-9]+/.test(password)) {
				return { success: true, message: '' };
			} else {
				return { success: false, message: '密码需要包含数字' };
			}
		} else {
			return { success: false, message: '密码需要包含字母' };
		}
	}
}

export function validatePasswordRole(password) {
	//const reg = /(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]{5,16}/;
	if ((password.length >= 6) && (password.length <= 16)) {
		return { success: true, message: '' };
	}
	//return { success: false, message: '密码不符合要求！' };
	return { success: false, message: '密码在6-16位！' };
}

/* 是否是公司邮箱*/
export const isWscnEmail = str => {
	const reg = /^[a-z0-9](?:[-_.+]?[a-z0-9]+)*@wallstreetcn\.com$/i;
	return reg.test(str.trim());
};

/* 合法uri*/
export const validateURL = textVal => {
	const urlRegex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
	return urlRegex.test(textVal);
};

/* 小写字母*/
export const validateLowerCase = str => /^[a-z]+$/.test(str);

/* 大写字母*/
export const validateUpperCase = str => /^[A-Z]+$/.test(str);

/* 大小写字母*/
export const validAlphabets = str => validateLowerCase(str) || validateUpperCase(str);

/*是否为邮箱地址*/
export function isEmailString(str) {
	const reg = /^[a-zA-Z0-9][a-zA-Z0-9_\-.]{0,23}@(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]+$/i;
	return reg.test(str);
}

/*是否为手机号*/
export const validateCellPhoneNumber = str => /^1[3-9][0-9]{9}$/.test(str);

/*是否输入了2-20非汉字个字符*/
export const validateChars2to20 = str => /^\w{2,20}$/i.test(str.trim());


/*是否输入了2-20个字符*/
export const validateWords2to20 = str => /^[\u4e00-\u9fa5\w]{2,20}$/i.test(str.trim());

