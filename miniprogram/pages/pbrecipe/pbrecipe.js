// pages/pbrecipe/pbrecipe.js
const { tips } = require('../../utils/tip');
let api = require('../../utils/api');
let {Table,File} = require('../../utils/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeList:[], // 菜谱分类数据
    localTmpFiles:[], // 本地图片路径
    loadAct:false // loading动画
  },
  // 选择本地图片
  selectFile(files) {
    // console.log(files, 'selectFile')
    // 返回false可以阻止某次文件上传
  },
  // 上传本地图片
  uploadFile(files) {
    // console.log(files, 'uploadFile')
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
          resolve({urls: files.tempFilePaths})
        })
  },
  // 批量上传图片
  async uploadYun(){
    // 获取图片路径集合
    let {localTmpFiles} = this.data;
    // 遍历数组，挨个上传
    let promiseCol = localTmpFiles.map((item,index)=>{
      let suffix = item.split('.').pop();
      let newName = new Date().getTime() + '_' + index + '.' + suffix;
      // 上传至云端
      return wx.cloud.uploadFile({
        cloudPath: File.Img + '/' +newName, // 上传至云端的路径
        filePath: item // 小程序临时文件路径
      })      
    });
    // 批量顺序执行promise对象数组
    let yunFilesData = await Promise.all(promiseCol);
    // console.log(yunFilesData);

    // 组装数据  获取每个对象中的fileID
    let upLoadFilesData = yunFilesData.map((item)=>{
      return item.fileID
    });

   return upLoadFilesData;
  },


  
  // 监听上传失败
  uploadErr(e) {
    console.log('upload error', e.detail)
  },

  // 监听上传成功
  uploadSucc(e) {
      // console.log('upload success', e.detail)
      // 写入临时路径
      this.setData({
        localTmpFiles: this.data.localTmpFiles.concat(e.detail.urls) 
      })
  },
  // 监听本地图片删除（路径）
  delImg(e){
    let index = e.detail.index;
    this.data.localTmpFiles.splice(index,1);
    this.setData({localTmpFiles:this.data.localTmpFiles})
  },

  // 发布菜谱
  async pbRep(e){
    
    let {repMake,repName,repTypeid} = e.detail.value;
    // 验证是否填写完整信息
    if(repMake=='' || repName=='' || repTypeid==''){
      tips('请完整填写食谱信息！');
      return;
    }
    // 批量上传图片至云端（云存储中） 阿里云  oss 
    let filesIDList = await this.uploadYun();
    // 验证是否上传图片
    if(filesIDList.length < 1){
      tips('请至少上传一张图片！');
      return;
    }
    
    // 组装新数据
    let newData = {
      repMake,
      repName,
      repTypeid,
      filesIDList,
      follow:0,
      visiter:0,
      time:new Date()
    }
    // console.log(newData);
    // 添加到表中
    let stats = await api.addOne(Table.R,newData);
    if(stats.errMsg == "collection.add:ok"){
      tips('上传成功！')
      setTimeout(() => {
        wx.reLaunch({
          url: '../my/my',
        })
      }, 1500);
    }
  },

  // 获取菜谱分类数据
  async getTypeList(){
      let typeList =  await api.findAll(Table.T);
      this.setData({typeList:typeList.data});
  },
  onLoad(){
    // 获取菜谱分类列表
    this.getTypeList();

    // 
    this.setData({
      selectFile: this.selectFile.bind(this),
      uploadFile: this.uploadFile.bind(this)
    })

  }
 
})