import Dexie from 'dexie';
//生成用户库
const userDB = new Dexie('userDB');
userDB.version(1).stores({
    //账户表
    account: "++index,id,username,lastModify,lastToken"
});

const db = {
    install(Vue, option) {
        Vue.prototype.account = userDB.account;//用户表
        Vue.prototype.$dexie = Dexie;//原生Dexie 对象
    }
};

export default db;