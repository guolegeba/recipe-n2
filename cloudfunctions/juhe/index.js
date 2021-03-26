// 云函数入口文件
const cloud = require('wx-server-sdk');
// 云函数初始化
cloud.init({ env:'dev-test-9g47h97a30653b3b' });

//获取操作数据库的引用,一定放在环境初始化后
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  //左集合： c2-follow (repID) 右集合： c2-recipe(_id)
  return db.collection('c2-follow').aggregate()
         .sort({time:-1})
         .match({_openid: event._openid})
         .lookup({
           from: 'c2-recipe',
           localField: 'repID',
           foreignField: '_id',
           as: "followList"
         })
         .skip((event.page-1)*event.pageSize)
         .limit(event.pageSize)
         .end()

}