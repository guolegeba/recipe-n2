// pages/list/list.js
const { tips } = require('../../utils/tip');
let api = require('../../utils/api');
let {Table} = require('../../utils/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    where:{},
    repList:[],
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
    page:1,
    pageSize:5,
    isLoad:true, //上拉加载开关
    isHaveData:true, //数据展示开关
  },
  // 跳转到菜谱详情页
  toDetail(e){
    // console.log(e.currentTarget.dataset._id);
    wx.navigateTo({
        url: '../detail/detail?_id=' + e.currentTarget.dataset._id
    })
  },

  // 获取列表数据
  async getRecList(){
    let {page,pageSize,where}=this.data;
    let repListData = await api.findPage(Table.R,where,pageSize,page);
    // console.log(repListData);

    //判断是否展示数据
    if(repListData.data.length == 0 && page==1 ){
      this.setData({isHaveData:false});
      return;
    }
    // 判断是否支持上拉加载
    if(repListData.data.length < pageSize ){
      this.setData({isLoad:false});
    }

    let repListAdd = await api.addUserInfo(repListData.data);
    this.setData({
      repList: this.data.repList.concat(repListAdd)
    });
    // console.log(this.data.repList);
    wx.stopPullDownRefresh();
  },

  onLoad(options){
    if(options.keyword){
      // 搜索页面跳过来
      // console.log('搜索过来');
      let where = {
        repName: api.db.RegExp({
          regexp: options.keyword,
          options: 'i',
        })
      };
      this.setData({ where });

    }else{
      // 类型页面过来
      // console.log('类型过来');
      let {typename,_id}  = options;
      this.setData({ where: {repTypeid:_id} })
      wx.setNavigationBarTitle({
        title: typename,
      });
    }
    this.getRecList();
  },

    // 监听上划加载事件
    onReachBottom(){
      if(this.data.isLoad){
        tips('数据加载中','loading');
        ++this.data.page;
        console.log(this.data.page);
        this.getRecList(this.data._id);
  
      }
    },

     // 监听下拉刷新
  onPullDownRefresh(){
    tips('数据更新中...','loading');
    setTimeout(()=>{
      this.setData({
        repList:[],
        page: 1,
        isLoad: true,
        isHaveData: true
      });
      this.getRecList(this.data._id);
    },1000)
  } 
})