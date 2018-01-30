// pages/sharePk/sharePk.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    shareText:[
      '发了一个红包拼图',
      '转发到好友或聊群',
      '我也试一下',
    ],
    qrPic:'',
    oid:''
  },
  goPinTu(){
    wx.navigateTo({
      url: '/pages/pinTu/pinTu?userName=' + this.data.userInfo.nickName + '&userPic=' + this.data.userInfo.avatarUrl + '&order=' + this.data.oid + '&user=' + app.uid
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      oid: options.oid
    })
    this.getUserInfo()
    this.getShareQr(options.oid)
  },

  // 获取用户信息
  getUserInfo(){
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

  // 获取小程序分享码
  getShareQr(oid){
    var _this = this
    wx.request({//注册登陆
      url: app.apiUrl + 'qrcode',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      dataType: 'json',
      data:{
        url: 'pages/pinTu/pinTu?order='+oid+'&user='+app.uid,
      },
      success: function (back) {
        console.log(back)
        _this.setData({
          qrPic: app.picUrlHead+back.data.date.path
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '一起来PK吧',
      path: '/pages/pinTu/pinTu?userName=' + this.data.userInfo.nickName + '&userPic=' + this.data.userInfo.avatarUrl + '&order=' + this.data.oid + '&user=' + app.uid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})