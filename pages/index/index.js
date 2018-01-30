//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    winH:'',
    winW:'',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    welcomeText:'选择一张珍藏的图片，好友拼出来才能获得赏金',
    uploadPic:'/assets/imgs/uploadPic.png',
    uploadPicW:120*315/471+'px',
    warningText:'请勿上传色情及其他违规图片，本小程序有权在收到投诉后删除相应内容',
    uploadUrl:app.apiUrl+'upFile',
    picUrlHead: app.picUrlHead,
  },

  onLoad: function () {

    // wx.navigateTo({
    //   // url: '../pinTu/pinTu',
    //   // url:"../cropper/index",
    //   url: "../sharePk/sharePk",
    // })

    this.setData({
      winH: wx.getSystemInfoSync().windowHeight + 'px'
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  goChooseGrid: function(e) {
     wx.navigateTo({
      url: '../chooseGrid/chooseGrid'
    })
  },
  goCropper(){
    wx.navigateTo({
      url: '../cropper/index'
    })
  },
  choosePic(){
    var _this = this
    wx.chooseImage({
      count: 1, 
      sizeType: ['original', 'compressed'], 
      sourceType: ['album', 'camera'], 
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        var typePicArr = tempFilePaths[0].split('.')
        var typePic = typePicArr[typePicArr.length - 1]
        
        if (typePic!='gif'){
          // 上传
          _this.upLoad(_this, tempFilePaths)
        }
      }
    })
  },
  upLoad(page, path){
    var _this = this
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    })
    
    wx.uploadFile({
      url: _this.data.uploadUrl,
      filePath: path[0],
      name: 'file',
      formData: {
        myFile:'myFile'
      },
      success: function (res) {
        var data = res.data
        console.log(JSON.parse(data))

        // 跳转到裁剪
        wx.navigateTo({
          url: '../cropper/index?pic=' + _this.data.picUrlHead + JSON.parse(data).new_fname,
        })
      },
      fail: function (e) {
        console.log(e);
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        })

      },
      complete: function () {
        wx.hideToast();  //隐藏Toast
      }
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
