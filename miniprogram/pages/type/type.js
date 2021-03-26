// pages/type/type.js
const { tips } = require('../../utils/tip');
let api = require('../../utils/api');
let {Table,File} = require('../../utils/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeList:[],
    types:[
      {typename:"营养菜谱",'src':"../../static/type/type01.jpg"},
      {typename:"儿童菜谱",'src':"../../static/type/type02.jpg"},
      {typename:"家常菜谱",'src':"../../static/type/type03.jpg"},
      {typename:"主食菜谱",'src':"../../static/type/type04.jpg"},
      {typename:"西餐菜谱",'src':"../../static/type/type05.jpg"},
      {typename:"早餐菜谱",'src':"../../static/type/type06.jpg"},
    ],
    page: 1, //分页查询页码
    pageSize: 8, //分页查询页面量
    isLoad:true, //上拉加载开关
    isHaveData:true, //数据展示开关
  },
  // 跳转到菜系列表页面
  toList(e){
    let {typename,_id} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../list/list?_id='+ _id+'&typename='+typename,
    })
  },
  // 获取类型列表
  async getTypeList(){
    let {page,pageSize} = this.data;

    let typeList = await api.findPage(Table.T,{},pageSize,page);
    // console.log(typeList);
    

    //判断是否展示数据
    if(typeList.data.length == 0 && page==1 ){
      this.setData({isHaveData:false});
      return;
    }
    // 判断是否支持上拉加载
    if(typeList.data.length < pageSize ){
      this.setData({isLoad:false});
    }
    this.setData({typeList: this.data.typeList.concat(typeList.data) });

    // 关闭刷新
      wx.stopPullDownRefresh();
  },
  onLoad(){
    this.getTypeList();
  },
  // 监听上划加载事件
  onReachBottom(){
    if(this.data.isLoad){
      console.log(123);
      tips('数据加载中','loading');
      ++this.data.page;
      this.getTypeList();
    }
  },
  // 监听下拉刷新
  onPullDownRefresh(){
    tips('数据更新中...','loading');
    setTimeout(()=>{
      this.setData({
        typeList:[],
        page: 1,
        isLoad: true,
        isHaveData: true
      })
      this.getTypeList();
    },1000)
  }
})