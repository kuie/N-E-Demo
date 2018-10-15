export const parseTime = (time, format = '{y}-{m}-{d} {h}:{i}:{s}') => {	//将时间格式化为以下格式：2018-04-19 00:00:00
	if (!arguments.length) return null;
	let date;
	if (typeof time === 'object') {
		date = time;
	} else {
		if (('' + time).length === 10) time = parseInt(time) * 1000;
		date = new Date(time);
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	};
	return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key];
		if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1];
		if (result.length > 0 && value < 10) value = '0' + value;
		return value || 0;
	});
};

export const formatTime = (time, option) => {
	time = time * 1000;
	const d = new Date(time),
		now = Date.now(),
		diff = (now - d) / 1000;
	if (diff < 30) {
		return '刚刚';
	} else if (diff < 3600) { // less 1 hour
		return Math.ceil(diff / 60) + '分钟前';
	} else if (diff < 3600 * 24) {
		return Math.ceil(diff / 3600) + '小时前';
	} else if (diff < 3600 * 24 * 2) {
		return '1天前';
	}
	if (option) {
		return parseTime(time, option);
	} else {
		return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分';
	}
};

export const list2Tree = (list, props = {
	id: 'id',//子集标识符
	pId: 'parentId',//父级标识符
	child: 'children',//子队列标识符
	level: 'level'//节点所在级别
}) => {
	/*
	返回的Tree仅为预置数据,Tree下的id为null，仅有childItems属性
	Tree仅返回一颗树，所有节点被统一放置在childItems数组中
	节点的树结构根据列表中的父节点id确定，一个节点有且仅有一个父节点
	无父节点节点将会被放置在Tree下的childItems数组中
	Tree的关键词可在props属性中设置，
	类似vue的props使用方法，但仅可设置三个属性
	props有默认值，调用时不需要指定，
	如需指定如下：
	节点id：id，
	父节点id：parentId，
	子节点数组：childItems
	* */
	const appendChild = (node, level) => {
		list = list.filter(val => {
			/*不要修改为全等！！！，判断根节点与子节点的区分
			添加不存在父级id的判断*/
			if (val[props.pId] == node[props.id] || /^(false|null|undefined|)$/.test(val[props.pId])) {
				if (!node[props.child]) node[props.child] = [];
				typeof val[props.id] === 'number' && (val[props.id] += '');
				typeof val[props.pId] === 'number' && (val[props.pId] += '');
				node[props.level] = level;
				node[props.child].push(val);
				return false;
			}
			return true;
		});
		if (!node[props.child]) {
			node[props.level] = level;
		} else {
			node[props.child].forEach(child => appendChild(child, level + 1));
		}
	};
	const Tree = {};
	Tree[props.id] = false;
	Tree[props.child] = [];
	appendChild(Tree, 0);
	return Tree
};

export const findAllParents = (id, list, props = {
	id: 'id',
	pId: 'parentId'
}, array = []) => {
	if (!id) return array;
	let parent;
	list.some(val => {
		if (id == val[props.id]) {
			parent = val;
			return true;
		}
	});
	if (!parent) return array;
	array.unshift(parent[props.id]);
	if (parent[props.pId]) {
		return findAllParents(parent[props.pId], list, props, array);
	} else {
		return array;
	}
};
//寻找选中的所有节点
/**
 * list tree结构数组
 * id 寻找的目标节点id
 */
export const findTreeNode = function(list, id, arr, parentNode, props = {
	id: 'id',
	pId: 'parentId',
	children: 'children'
}) {
	arr = arr ? arr : [];
	for (let i = 0; i < list.length; i++) {
		let item = list[i];
		if (item[props.id] == id) {
			arr.unshift(item);
			if (parentNode) {
				arr.unshift(parentNode);
			}
			break;
		} else if (item[props.children] && item[props.children].length) {
			arr = findTreeNode(item[props.children], id, arr, item);
			if (arr[0] == item) {
				if (parentNode) {
					arr.unshift(parentNode);
				}
				break;
			}
		}
	}
	return arr;
};

export const str2Time = (str) => {
	const arr = /^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d):(\d\d)[.\dZ]{0,5}$/.exec(str);
	return new Date(arr[1], arr[2] - 1, arr[3], arr[4], arr[5], arr[6]);
	// return `${arr[1]}-${arr[2]}-${arr[3]}T${arr[4]}:${arr[5]}:${arr[6]}.000Z`;
};