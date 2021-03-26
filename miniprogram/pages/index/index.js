const { tips } = require('../../utils/tip');
let api = require('../../utils/api');
let {Table} = require('../../utils/config');

Page({
    data: {
        types: [
            {
                src: "../../imgs/index_07.jpg",
                typename: "营养菜谱"
            },
            {
                src: "../../imgs/index_09.jpg",
                typename: "儿童菜谱"
            },
        ],
        recipes:[
            {
                recipeName:"烤苏格兰蛋",
                src:"../../imgs/1.jpg"
            },
            {
                recipeName:"法国甜点",
                src:"../../imgs/2.jpg"
            },
            {
                recipeName:"法式蓝带芝心猪排",
                src:"../../imgs/3.jpg"
            },
            {
                recipeName:"菠萝煎牛肉扒",
                src:"../../imgs/4.jpg"
            },
            {
                recipeName:"快手营养三明治",
                src:"../../imgs/5.jpg"
            },
            {
                recipeName:"顶级菲力牛排",
                src:"../../imgs/6.jpg"
            }
        ],
        HotList:[]
    },
    // 跳转到菜谱分类页面
    toType(e){
        wx.reLaunch({
          url: '../type/type'
        })
    },
    // 跳转到菜谱详情页
    toDetail(e){
        wx.reLaunch({
            url: '../detail/detail?_id=' + e.currentTarget.dataset._id
        })
    },
    async getHotRepList(){
        let HotListData = await api.findPage(Table.R,{},6,1,
            {fileds: 'visiter',sort: 'desc'});
        // console.log(HotListData);
        let HotList = await api.addUserInfo(HotListData.data);
        // console.log(HotList);
        this.setData({HotList});
    },

    onLoad(){
        tips('数据加载中','loading');
        this.getHotRepList();
    },

    // 监听分享给朋友
    onShareAppMessage(){
        return{ title: '饭点一刻'}
    },

    // 监听分享到朋友圈
    onShareTimeline(){
        return{ title: '饭点一刻'}
    }


})