//app.js
App({
  apiUrl:'https://f.3ih.org/gs_pintuan/index.php/Home/Login/',
  picUrlHead:'https://f.3ih.org/gs_pintuan/',
  openId:'',
  uid:'',
  onLaunch: function () {
    var _this = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    var promise = new Promise((resolve, reject)=>{

      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wx.request({//注册登陆
            url: _this.apiUrl+'wxlogin',
            data: {
              'code': res.code,
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            dataType: 'json',
            success: function (back) {
              // console.log(back)
              _this.openId = back.data.data.openid

              resolve()
            },
            fail: function (res) {
              console.log(res)
            }
          })
        }
      })

    })

    promise.then(()=>{
      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // console.log(res)
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }

                this.addUser(this.openId, res.userInfo.nickName, res.userInfo.avatarUrl)
              }
            })
          }
        }
      })

    })

  },
  globalData: {
    userInfo: null
  },
  addUser(openid, name, photo){
    var _this = this
    wx.request({
      url: _this.apiUrl +'user_add',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      dataType: 'json',
      data:{
        openid:openid,
        name:name,
        photo: photo
      },
      success:res=>{
        // console.log(res)
        _this.uid = res.data.data
      }
    })
  }
})