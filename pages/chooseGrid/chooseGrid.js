// pages/chooseGrid/chooseGrid.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    openId:'',
    array: ['美国', '中国', '巴西', '日本'],
    index:0,
    gridText:[
      '拼图难度', 
      '赏金（元）', 
      '数量（个）', 
      '填写打赏的金额',
      '填写可以玩的人数',
      '未领完的金额将在48小时后退至本小程序余额',
      '生成拼图PK'
    ],
    radioItems: [
      { name: '3x3', value: '3', checked: 'true' },
      { name: '4x4', value: '4' },
      { name: '5x5', value: '5' }
    ],
    radioSelect:[],
    radioSelectNo:'3',
    picGridH: '0px',
    moneyIn:'',
    personIn:'',
    picUrl:'',
    chooseUrl:app.apiUrl+'screenshot',
  },
  radioChange: function (e) {
    var checked = e.detail.value
    var changed = {}
    var radioSelectdata = []
    for (var i = 0; i < this.data.radioItems.length; i++) {
      if (checked.indexOf(this.data.radioItems[i].name) !== -1) {
        changed['radioItems[' + i + '].checked'] = true
        for (var j = 0; j < (i + 3) * (i + 3);j++){
          radioSelectdata.push(j)
        }
        this.setData({
          radioSelect: radioSelectdata,
          radioSelectNo:i+3
        })
      } else {
        changed['radioItems[' + i + '].checked'] = false
      }
    }
    this.setData(changed)
    this.setData({
      picGridH: 'auto',
    })
  },
  moneyIn(e){
    this.setData({
      moneyIn:e.detail.value
    })
  },
  personIn(e) {
    this.setData({
      personIn: e.detail.value
    })
  },
  upLoad(page, path) {
    var _this = this
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    })

    wx.uploadFile({
      url: _this.data.chooseUrl,
      filePath: path,
      name: 'file',
      formData: {
        openid:app.openId,
        uid:app.uid,
        path: _this.data.picUrl,
        desc:_this.data.array[_this.data.index],
        num: _this.data.radioSelectNo,
        money: _this.data.moneyIn,
        check:_this.data.personIn
      },
      success: function (res) {
        console.log(res)
        var datas = JSON.parse(res.data)
        console.log(datas)
        var keys = datas.date.gets.date
        var oid = datas.date.order

        // 支付接口
        // wx.requestPayment({
        //   'timeStamp': keys.timeStamp,
        //   'nonceStr': keys.nonceStr,
        //   'package': keys.package,
        //   'signType': keys.signType,
        //   'paySign': keys.paySign,
        //   'success': function (res) {
        //     console.log(res)
        //     if (res.errMsg == 'requestPayment:ok'){
              // 去分享页面
              wx.navigateTo({
                url: '../sharePk/sharePk?oid='+oid,
              })
        //     }
        //   },
        //   'fail': function (res) {
        //     console.log(res)
        //   },
        //   complete: function (res) {
        //     console.log(res);
        //   }
        // })
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
  goShare(){
    // 提交图片信息
    this.upLoad(this, this.data.picUrl)
  
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.openId,this.data.openId)
    // console.log(wx.getStorageSync('openId'))
    // gridcon
    this.setData({
      picUrl:options.pic,
      picGridH : '8rem',
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
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})