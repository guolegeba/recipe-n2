// pages/my/my.js
const { tips } = require('../../utils/tip');
let {Table,adminID} = require('../../utils/config');
const api = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chgIdx:0,
    userInfo:'',
    isLogin: true, //是否登录。 false 未登录  true，已经登录
    myRepList:[],
    myFollowList:[],
    page: 1, //分页查询页码
    pageSize: 4, //分页查询页面量
    isLoad:true, //上拉加载开关
    isHaveData:true, //数据展示开关
    lists:[
      {
        src:"../../static/list/list01.jpg",
        name:"土豆小番茄披萨",
        userInfo:{
          nickName:"林总小图",
          pic:"../../static/list/users.png"
        },
        views:999,
        follow:100
      },
      {
        src:"../../static/list/list02.jpg",
        name:"草莓巧克力三明治",
        userInfo:{
          nickName:"林总小图",
          pic:"../../static/list/users.png"
        },
        views:88,
        follow:200
      },
      {
        src:"../../static/list/list03.jpg",
        name:"法师意大利面",
        userInfo:{
          nickName:"林总小图",
          pic:"../../static/list/users.png"
        },
        views:999,
        follow:100
      },
      {
        src:"../../static/list/list04.jpg",
        name:"自制拉花",
        userInfo:{
          nickName:"林总小图",
          pic:"../../static/list/users.png"
        },
        views:999,
        follow:100
      },
      {
        src:"../../static/list/list05.jpg",
        name:"营养早餐",
        userInfo:{
          nickName:"林总小图",
          pic:"../../static/list/users.png"
        },
        views:999,
        follow:100
      }
    ],
  },
  // 登录操作
  wxlogin(e){
    // 1、判断授权框弹出后是否点击授权
    // 点击拒绝
    if(e.detail.errMsg !=  'getUserInfo:ok'){
      tips("请先登录（授权）");
      return; 
    };
    // 点击允许
    let userInfo = e.detail.userInfo;
    wx.setStorageSync('userInfo', userInfo);
    // 执行微信登录
    wx.login({
      success: async res=>{
        this.setData({
          userInfo,
          isLogin: true
        })
        // 查询用户是否在数据库中
        // 1.获取当前用户的_openid
        let _openid = await api.getOpenid();
        let data = await api.findWhere(Table.U,{_openid});        
        if(data.data.length > 0){
          // 说明曾经登录过
          tips("欢迎回来！");
          wx.setStorageSync('_openid', _openid);
          this.getMyRepList();
        }else{
          // 保存数据到数据库
          let status = await api.addOne(table.U,{userInfo});
          if(status._id){ // 登录成功
            tips('登录成功!');
            wx.setStorageSync('_openid', _openid);  
            this.getMyRepList();
          }else{ tips('请重试!') }          
        }
        
      }
    })
  },
  // 跳转到分类管理页面
  goToCate(){
    let _openid = wx.getStorageSync('_openid');
    // 判断是否为管理员
    if(adminID.findIndex(item => item==_openid) != -1){
      wx.navigateTo({
        url: '../category/category',
      })
    }
  },
  // 获取我的菜单信息
  async getMyRepList(){
    let _openid = wx.getStorageSync('_openid');
    let {pageSize,page,myRepList} = this.data;

    let myList = await api.findPage(Table.R,{_openid},pageSize,page);
    // console.log(myList);
    
    //判断是否展示数据
    if(myList.data.length == 0 && page==1 ){
      this.setData({isHaveData:false});
      return;
    }

    // 判断是否支持上拉加载
    if(myList.data.length < pageSize ){
      this.setData({isLoad:false});
    }

    // 追加发布者信息
    let myListAdd = await api.addUserInfo(myList.data);
    // console.log(myListAdd);
    
    this.setData({
      myRepList: myRepList.concat(myListAdd)
    })
  },
  // 获取我的收藏列表
  async getMyFollowList(){
    let _openid = wx.getStorageSync('_openid');
    let {pageSize,page,myFollowList} = this.data;
    let myList = await api.yun('juhe',{
      _openid,pageSize,page
    });
    myList = myList.result.list;
    // console.log(myList);

    //判断是否展示数据
    if(myList.length == 0 && page==1 ){
      this.setData({isHaveData:false});
      return;
    }
    // 判断是否支持上拉加载
    if(myList.length < pageSize ){
      this.setData({isLoad:false});
    }

    // 追加发布者信息
    let myListAdd = await api.addUserInfo(myList);
    // console.log(myListAdd);
    // 把关注度提到第一级，方便循环读取星星
    myListAdd.map(item=>{
      item.follow = item.followList[0].follow
    })
    this.setData({
      myFollowList: myFollowList.concat(myListAdd)
    })

  },
  // 菜单栏切换
  chgMenu(e){
    tips('数据加载中','loading');
    // 给涉及到上拉加载的变量初始化
    this.setData({
      myRepList:[],
      myFollowList:[],
      page:1,
      isHaveData:true,
      isLoad: true,
      chgIdx: e.currentTarget.dataset.idx
    })
    // 切换判断
    if(this.data.chgIdx == 1){
      this.getMyFollowList();
    }else{
      this.getMyRepList();
    }
  },
  onLoad(){
    // 检测是否登录
    wx.checkSession({
      success: (res) => {
        let users = (wx.getStorageSync('userInfo'));
        if(users == ''){
          this.setData({ isLogin:false });
          tips('请登录！');
          return;
        }
        // 已经登录
        tips('数据加载中','loading');
        // 获取我的菜单数据
        this.getMyRepList();
        this.setData({
          userInfo: users,
          isLogin: true
        })
      },
      fail: (err)=>{
        // 未登录或失效
        this.setData({ isLogin:false });
        tips('请登录！');
      }
    })
  },
  // 长按触发删除（bindlongpress）
  _delStyle(){
    wx.showModal({
      title:"删除提示",
      content:"确定要删除么？"
    })
  },
  // 跳转到发布页面
  toPbrecipe(){
    wx.navigateTo({
      url: '../pbrecipe/pbrecipe',
    })
  },
  // 跳转到详情页
  toDetail(e){
    wx.navigateTo({
        url: '../detail/detail?_id=' + e.currentTarget.dataset._id
    })
  },
  // 监听上划加载事件
  onReachBottom(){
    if(this.data.isLoad){
      tips('数据加载中','loading');
      ++this.data.page;
      if(this.data.chgIdx==0){
        this.getMyRepList();
      }else{
        this.getMyFollowList();
      }
      
    }
  },
  // 监听下拉更新
  onPullDownRefresh(){
    tips('数据更新中...','loading');
    setTimeout(()=>{
      this.setData({
        myRepList:[],
        myFollowList:[],
        page: 1,
        isLoad: true,
        isHaveData: true
      });
      if(this.data.chgIdx==0){
        this.getMyRepList();
      }else{
        this.getMyFollowList();
      }
    },1000)
  }
})