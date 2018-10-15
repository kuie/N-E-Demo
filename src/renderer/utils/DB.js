import Dexie from 'dexie';
let db = new Dexie("comic_book_db");
db.version(1).stores({ comic: '++id,index,name' });
onmessage = res => {
	//删库并刷入新数据
	db
		.delete()
		.then(() => console.log('原数据已删除'))
		.then(() => db.open())
		.then(() => db.comic.bulkPut(res.data[1]))
		.catch(e => console.log(e))
		.then(lastId => postMessage({ code: 200, msg: `新增数据：${lastId}条` }))
		.catch(e => console.log(e)).finally(() => {
		close();
	});
};
