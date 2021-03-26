// pages/detail/detail.js
const { tips,modalToLogin } = require('../../utils/tip');
let api = require('../../utils/api');
let {Table} = require('../../utils/config');
const tip = require('../../utils/tip');

Page({

  /**
   * 页面的初始数据
   */
  data: {
      detailData:[],
      isFollow: false,
      isLogin: true,
      followID: ''
  },
  // 获取菜谱详细信息
  async getRep(_id){
    // 增加点击量
    let visi = await api.editOne(Table.R,_id,{visiter: api._.inc(1) });
    // 获取菜谱数据
    let Data = await api.findWhere(Table.R,{_id});
    // 根据菜谱数据获取上传者信息
    let info = await api.findWhere(Table.U,{_openid:Data.data[0]._openid});
    // 根据菜谱数据获取菜谱分类名
    let typename = await api.findWhere(Table.T,{_id:Data.data[0].repTypeid});

    // 整合数据
    let detailData = Data.data[0];
    detailData.userInfo = info.data[0].userInfo;
    detailData.typename = typename.data[0].typename;
    // console.log(detailData);

    // 动态设置标题
    wx.setNavigationBarTitle({
      title: detailData.typename
    });
    this.setData({detailData});
  },

  // 收藏点击事件 
  async follow(){
    let {isLogin,isFollow,detailData,followID} = this.data;
    // 已经登录
    if(isLogin){
      let num = 1; // 定义自增/自减
      if(isFollow){ // 之前已经收藏，点击取消
        // 删除follow表中数据
        let del = await api.delOne(Table.F,followID);
        // 修改
        num = -1;
        followID = '';

      }else{ // 之前未收藏，点击关注
        // 增加到follow表
        let add = await api.addOne(Table.F,{repID:detailData._id,time: new Date()});
        // console.log(add);
        followID = add._id; // 存储收藏数据的id方便后期取消使用
      }

      // 修改菜谱本身的收藏量
      let edit = await api.editOne(Table.R,detailData._id,{follow: api._.inc(num)});

      // console.log(detailData.follow );
      // 页面改变
      detailData.follow += num;
      // console.log(detailData.follow );
    

      // 修改isFollow状态
      this.setData({
        isFollow: !isFollow,
        detailData,
        followID
      });
    }else{
      modalToLogin();
    }
  },


  // 页面初次加载
  async onLoad(options){
    // 获取菜单详细信息
    let result = await this.getRep(options._id);
    
    // 判断菜单是否被当前用户收藏
    wx.checkSession({
      success: async (res) => {
        let _openid = wx.getStorageSync('_openid');
        let followData = await api.findWhere(Table.F,{_openid,repID:this.data.detailData._id});
        // console.log(followData);
        // 判断是否有收藏记录（用户的_openid, 菜谱的_id）
        if(followData.data.length > 0){
          this.setData({
            isFollow: true,
            followID: followData.data[0]._id
          })
        }
      },
      fail: err =>{ 
        this.setData( {isLogin:false} )
      }
    })
    

  },

  // 监听分享给朋友
  onShareAppMessage(){
    return{ title: this.data.detailData.repName}
  },

  // 监听分享到朋友圈
  onShareTimeline(){
    return{ title: this.data.detailData.repName}
  }

})