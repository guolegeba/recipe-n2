// pages/search/search.js
const { tips } = require('../../utils/tip');
let {Table} = require('../../utils/config');
const api = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotRep:[],
    hisRep:[],
    isHaveHis: true,
    searchWord:'',
    tapTime: '',		// 防止两次点击操作间隔太快
  },

  // 获取热门菜谱（浏览度）
  async getHotRep(){
    let hotRepList = await api.findPage(Table.R,{},9,1,{fileds:'visiter',sort:'decs'});
    // console.log(hotRepList);
    this.setData({
      hotRep: hotRepList.data
    })
  },
  getHisRep(){
    // 搜索记录写在本地缓存
    let hisRepList = wx.getStorageSync('hisKeywords') || [];
    // console.log(hisRepList);
    // 判断是否有搜索记录
    if(hisRepList.length >0 ){
      this.setData({ 
        hisRep: hisRepList,
        isHaveHis:true
      });
    }else{
      this.setData({
        isHaveHis:false,
        hisRep: []
      })
    }
  },

  onShow(){
    tips('数据加载中','loading');
    this.getHotRep();
    this.getHisRep();
  },

  // 搜索
  search(e){
    //获取输入框搜索关键词
    let { searchWord,tapTime } = this.data;
    
    var nowTime = new Date();
      if (nowTime - tapTime < 1000) {
          console.log('阻断')
          return;
      }
      console.log('执行')
      this.setData({ tapTime: nowTime });

    //获取最热或者历史搜索关键词
    let name = e.currentTarget.dataset.name ||'';
 
    // 判断是否传递搜索关键词
    if(searchWord.trim() == '' &&  name == ''){
      tips('请输入搜索关键词！');
      return;
    }
    
    //统一搜索关键词
    let keyword = name == '' ? searchWord : name;

    // 搜索关键词在本地缓存的操作
    // 1、判断当前搜索关键词是否已经存在缓存中
    let hisRepList = wx.getStorageSync('hisKeywords') || [];
    let index = hisRepList.findIndex(item=>item==keyword);
    // 2、不存在就推挤覆盖写入缓存
    if(index == -1){
      let newRepList = hisRepList.splice(0,5);
      newRepList.unshift(keyword);
      // 重新存入缓存
      wx.setStorageSync('hisKeywords', newRepList)
      // console.log(newRepList);
    }else{ 
      // 存在就把位置提前到第一位
      hisRepList.splice(index,1);
      hisRepList.unshift(keyword);
      // 重新存入缓存
      wx.setStorageSync('hisKeywords', hisRepList)
      // console.log(hisRepList);
    }
    this.setData({ searchWord: ''});
    // 跳到菜谱列表页面
    wx.navigateTo({
      url: '../list/list?keyword='+keyword,
    })

  },

  // 清除记录
  clearStorage(){
    wx.removeStorage({
      key: 'hisKeywords'
    });
    this.getHisRep();
  },

  onPullDownRefresh(){
    tips('数据更新中...','loading');
    setTimeout(()=>{
      this.setData({
        hotRep:[],
        hisRep:[],
        isHaveHis: true,
        searchWord:''
      });
      this.getHotRep();
      this.getHisRep();
    },1000)
  } 



  
})