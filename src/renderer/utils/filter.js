import *as selectListAll from './selectList';

export const list2Filter = (value, list, props = { value: 'value', label: 'label' }) => {
	let result = '';
	list.some(val => {
		if (val[props.value] == value) {
			result = val[props.label];
			return true;
		}
	});
	if (result) {
		return result;
	} else {
		// console.log(`不存在枚举值${value}`);
	}
};
const arrayMixin = (list, mixin) => {
	if (!mixin) return list;
	if (mixin instanceof Array) {
		return list.concat(mixin)
	} else {
		console.log(`config.mixin必须为数组格式`);
		return list;
	}
};
const appendAll = (list, hasAll, config) => {
	if (!hasAll) {
		return list;
	} else if (hasAll instanceof String) {
		return list.concat([{ [config.value]: hasAll, [config.label]: '' }]);
	} else if (hasAll instanceof Boolean) {
		return list.concat([{ [config.value]: '全部', [config.label]: '' }]);
	} else {
		console.log('config.hasAll只接受Boolean值、字符串');
	}
};
/*
* @filter
* config :可为字符串，数组，对象
* 当config为字符串时根据selectListAll中的同名list 进行过滤
* 当config为数组时以该数组为list进行过滤
* 当config为对象时以config.list作为列表进行过滤
*      value为指定过滤项的主键值
*      label为指定过滤项的展示值
*      mixin为混淆数组，作为与list进行混淆处理的数据，目前只允许一个数组进行混淆
*      hasAll为快速混淆“全部”功能
* */
export const filter = (value, config = []) => {
	if (typeof config === 'string') {
		return selectListAll[config] ? list2Filter(value, selectListAll[config]) : `不存在${config}枚举列表`;
	} else if (config instanceof Object) {
		if (config instanceof Array) {
			return list2Filter(value, config);
		} else {
			if (!config.list) {
				console.log('缺少必要参数config.list');
				return '缺少必要参数config.list';
			}
			const props = {
				value: config.value || 'value',
				label: config.label || 'label'
			};
			config.list = arrayMixin(config.list, config.mixin);
			config.list = appendAll(config.list, config.hasAll, props);
			return list2Filter(value, config.list, props);
		}
	} else {
		console.log(`config参数配置错误`);
		console.log(JSON.stringify(config));
		return `config参数配置错误`;
	}
};
export default filter;