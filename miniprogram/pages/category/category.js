// pages/category/category.js
const { tips } = require('../../utils/tip');
let api = require('../../utils/api');
let {Table} = require('../../utils/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    editBox: true,
    addBox: true,
    typename:'',
    typeList:[],
    curIdx: -1
  },
  // 显示添加框
  showAddBox(){
    this.setData({ addBox: false, editBox: true });
  },
  // 添加一个类型
  async add(){
    // 检查类型名
    let {typename,curIdx,typeList} = this.data;
    // 判断参数是否为空
    if(typename.trim() == ''){
      tips('请输入菜谱分类名称!');
      return;
    };
    // 判断菜谱分类名称是否已经存在
    let index = typeList.findIndex((item)=>{
      return item.typename == typename
    })
    if(index != -1){
      tips('该名称已存在!');
      return;
    }
    let res = await api.addOne(Table.T,{typename:this.data.typename});
    if(res.errMsg == 'collection.add:ok'){
      tips('添加成功！');
      // 构建对象，加入页面列表
      let _openid = api.getOpenid();
      let newType = {
        _id:res._id,
        typename:this.data.typename,
        _openid
      };
      this.data.typeList.push(newType);
      this.setData({
        typename:'',
        addBox: true,
        typeList: this.data.typeList
      });
    }
  },
  // 显示修改框
  showEditBox(e){
    let {typename,index} = e.currentTarget.dataset;
    this.setData({
      addBox: true,
      editBox: false,
      typename,
      curIdx: index
    });
  },
  // 修改一条数据
  async edit(){
    // 检查类型名
    let {typename,curIdx,typeList} = this.data;
    // 判断参数是否为空
    if(typename.trim() == ''){
      tips('请输入菜谱分类名称!');
      return;
    };
    // 判断菜谱分类名称是否已经存在
    let index = typeList.findIndex((item)=>{
      return item.typename == typename
    })
    if(index != -1){
      tips('该名称已存在!');
      return;
    }
    
    let _id = typeList[curIdx]._id;
    let res = await api.editOne(Table.T,_id,{typename});
    //
    if(res.stats.updated == 1){
      tips('修改成功！');
      typeList[curIdx].typename = typename;
      this.setData({
        typename:'',
        editBox: true,
        curIdx: -1,
        typeList
      });
    }
    
  },
  // 删除一条数据
  async del(e){
    let {index,_id} = e.currentTarget.dataset;
    console.log(index);
    let res = await api.delOne(Table.T,_id);
    if(res.stats.removed == 1){
      tips('删除成功！');
      this.data.typeList.splice(index,1);
      this.setData({
        typeList:this.data.typeList
      })
    }
  },
  // 获取类型表
  async getTypeList(){
    let typeList =  await api.findAll(Table.T);
    this.setData({typeList:typeList.data});
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTypeList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})