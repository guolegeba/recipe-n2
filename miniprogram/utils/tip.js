// 弹出提示框
const tips = (title,icon='none')=>{
  wx.showToast({
    title, icon
  })
};

// 弹出模态框
const modalToLogin = (title)=>{
    wx.showModal({
      title: '登录失效',
      content: '是否去登录？',
      success: res=>{
        if(res.confirm){
          wx.reLaunch({
            url: '../my/my',
          })
        }
      }

    })
}


module.exports={
  tips,
  modalToLogin
}