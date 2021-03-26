let {Table} = require('./config');

// 获取操作数据的引用
const db = wx.cloud.database();

// 获取数据操作符
const _ = db.command;

// 操作云函数
const yun = (name,data={})=>{
  return wx.cloud.callFunction({
    name,data
  })
}

// 获取openid
const getOpenid = async ()=>{
  let data = await yun('yun0308');
  return data.result.openid;
}

// 查找符合条件的数据
const findWhere = (table,where)=>{
  return db.collection(table).where(where).get();
}

// 查找集合数据(promiseAll)
const findAll = async(table,where)=>{
    const MAX_LIMIT = 20;
    const countResult = await db.collection(table).count();
    const total = countResult.total;

    const batchTimes = Math.ceil(total/20);
    const tasks = [];
    for(let i=0; i<batchTimes; i++){
      const promise = db.collection(table).skip(i*MAX_LIMIT).limit(MAX_LIMIT).get();
      tasks.push(promise);
    }
    return (await Promise.all(tasks)).reduce(
      (acc,cur)=>{
        return { data: acc.data.concat(cur.data),
                 errMsg: acc.errMsg
                }
      })
}

// 分页查找数据
const findPage = (table,where,pageSize,page,orderBy= {fileds:'time',sort:'desc'})=>{
  return db.collection(table).where(where).skip((page-1)*pageSize).limit(pageSize).orderBy(orderBy.fileds,orderBy.sort).get();
}

// 添加一条数据
const addOne = (table,data)=>{
  return db.collection(table).add({data});
}

// 修改一条数据
const editOne = (table,id,data)=>{
  return db.collection(table).doc(id).update({data});
}

// 删除一条数据
const delOne = (table,id)=>{
  return db.collection(table).doc(id).remove();
}

// 追加用户信息
const addUserInfo = async (data)=>{
  // 获取promise对象数组 根据用户的openid查询用户数据
  let promiseArray = data.map((item)=>{
    return findWhere(Table.U,{_openid:item._openid})
  });
  
  let userData = await Promise.all(promiseArray);
  data.forEach((item,index)=>{
    item.userInfo = userData[index].data[0].userInfo;
  })
  return data;
}

module.exports={
    yun,
    _,
    db,
    getOpenid,
    findWhere,
    findAll,
    findPage,
    addOne,
    editOne,
    delOne,
    addUserInfo
}