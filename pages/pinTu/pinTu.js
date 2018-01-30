// pages/pinTu/pinTu.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ptt:[
      '眼比手快的那个是不是你',
      '去提现',
      '发口令',

      '去转发',
      '共',
      '元',

      '领取',
      '个',
      '投诉',

      '用时',
      '秒',
      '查看我的记录',
      ',',
      '请点击图片交换位置，完成拼图',
      '放弃挑战'
    ],
    userInfo: {},
    oid:'',
    uid:'',
    newUserId:'',
    userName:'',
    userPic:'',
    targetPic:'',
    money:'',
    check:'',
    title:'',

    pinStart:false,//开始拼图
    infoH:'',
    mShow:false,
    spendTime:0,
    showInt:'',
    saveSelect:[],
    saveTL:[],
    clickFlag:0,
    sOne:'',
    sTwo:'',
    radioSelect:[],
    positionArr:[],
    radioSelectNo: '9',
    rowNo:'',
    picGridH: '0px',
    animationData:[],
    withdraw:false,
    initData:{}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    this.getUserInfo()
    // 增加用户
    this.addUser(app.openId, this.data.userInfo.nickName, this.data.userInfo.avatarUrl)
    // 初始化
    var promise = new Promise((resolve,reject)=>{
      wx.request({
        url: app.apiUrl + 'pin_image',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        dataType: 'json',
        data: {
          uid: app.uid,
          oid: options.order,
        },
        success: res => {
          // console.log(res)
          resolve(res)
        },
        fail: res => {
          console.log(res)
        },
        complete: res => {
          console.log(res)
        }
      })
    })
    promise.then(res=>{
      // 得到几个宫格，并分裂数组
      var radioSelectdata = []
      var posData = []
      var animationArr = []

      var initData = res.data.date
      var initImage = initData.image
      var initList = initData.list
      var pics = initImage.photo
      var rowNo = Math.sqrt(pics.length)

      for (var j = 0; j < pics.length; j++) {
        var rowCount = this.rowCount(j, rowNo)

        // positionArr,存储正确位置
        var posItem = {
          top: 240 / rowNo * rowCount + 'px',
          left: 240 / rowNo * (j % rowNo) + 'px',
        }
        posData.push(posItem)

        // 存储首次的位置，分配拼图
        var radioSelectdataItem = {
          id: j,//pics[j].split(',')[0],
          top: 240 / rowNo * rowCount + 'px',
          left: 240 / rowNo * (j % rowNo) + 'px',
          src: app.picUrlHead+pics[j],//app.picUrlHead+pics[j].split(',')[1]
        }
        radioSelectdata.push(radioSelectdataItem)

        // 存储动画arr
        animationArr.push({})

      }

      // console.log(posData, radioSelectdata, animationArr)
      this.setData({
        uid:app.uid,
        targetPic: app.picUrlHead+initImage.url,
        money: initImage.money,
        check: initImage.check,
        title: initImage.title,
        initList: initList[0],
        userName: initImage.user_name,
        userPic: initImage.user_photo,

        positionArr: posData,
        radioSelect: radioSelectdata,
        animationData: animationArr,
        radioSelectNo:pics.length,
        rowNo: rowNo,
        infoH: wx.getSystemInfoSync().windowHeight + 'px',
        picGridH: '240px',
      })
    })
  },
  addUser(openid, name, photo) {
    var _this = this
    wx.request({
      url: app.apiUrl + 'user_add',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      dataType: 'json',
      data: {
        openid: openid,
        name: name,
        photo: photo
      },
      success: res => {
        // console.log(res)
        _this.setData({
          newUserId:res.data.data
        })
      }
    })
  },
  showModal(){
    var time = ''
    var _this = this
    var show = this.data.mShow
    var pinStart = this.data.pinStart
    var check = this.data.check

    if(check){
      this.setData({
        mShow:!show
      })

      if (!show){
        // 判断是否开始
        setTimeout(()=>{
          // 打乱
          _this.randomAct()

          _this.setData({ 
            showInt : setInterval(function () {
              time = _this.data.spendTime
              _this.setData({
                spendTime: time + 1
              })
            }, 1000),
            pinStart: !pinStart
          })
        }, 2000)
      }else{
        this.setData({
          spendTime: 0,
          pinStart:false
        })
        clearInterval(this.data.showInt)
      }
    }
  },
  clickPic(e){
    var _this = this
    var trueTL = this.data.saveTL
    var pinStart = this.data.pinStart
    // 判断开始
    if (pinStart){

      // 获取当前grid
      // 设置点击项目top left
      var radioSelectData = this.data.radioSelect
      var clickTrueCount = 0

      // 记录点击第一次，第二次的id
      var flag = this.data.clickFlag
      if(flag == 0){
        this.setData({
          sOne: e.currentTarget.dataset.vid,
          clickFlag: 1
        })
      }else if(flag == 1){
        // 执行交换赋值
        var sOneTop = '',
            sOneLeft = '',
            sTwoTop = '',
            sTwoLeft = '';
        
        // 取值
        for (var i = 0; i < radioSelectData.length; i++){
          if (radioSelectData[i].id == this.data.sOne){
            sOneTop = radioSelectData[i].top
            sOneLeft = radioSelectData[i].left
          }
          if (radioSelectData[i].id == e.currentTarget.dataset.vid){
            sTwoTop = radioSelectData[i].top
            sTwoLeft = radioSelectData[i].left
          }
        }

        // console.log('sOneTop:', sOneTop, ',sOneLeft:', sOneLeft, ',sTwoTop:', sTwoTop,',sTwoLeft:', sTwoLeft)

        // 赋值
        for (var n = 0; n < radioSelectData.length; n++) {
          // 动画
          var animation = wx.createAnimation({
            duration: 400,
            timingFunction: 'ease',
          })
          _this.animation = animation
          var bData = _this.data.animationData

          if (radioSelectData[n].id == this.data.sOne) {
            // 动画
            animation.top(sTwoTop).left(sTwoLeft).step()
            bData[_this.data.sOne] = animation.export()
            _this.setData({
              animationData: bData
            })
            // 赋值
            radioSelectData[n].top = sTwoTop
            radioSelectData[n].left = sTwoLeft
          }
          if (radioSelectData[n].id == e.currentTarget.dataset.vid) {
            // 动画
            animation.top(sOneTop).left(sOneLeft).step()
            bData[e.currentTarget.dataset.vid] = animation.export()
            _this.setData({
              animationData: bData
            })
            // 赋值
            radioSelectData[n].top = sOneTop
            radioSelectData[n].left = sOneLeft
          }
        }

        // 对比
        // 判断top和left是否匹配posData
        for (var m = 0; m < radioSelectData.length; m++){
          if (radioSelectData[m].top == trueTL[m].top && radioSelectData[m].left == trueTL[m].left){
            clickTrueCount += 1
          }
        }
        if (clickTrueCount == this.data.radioSelectNo){
          wx.request({
            url: app.apiUrl + 'image_success',
            data:{
              oid:_this.data.oid,
              uid: _this.data.newUserId,
            },
            method:'POST',
            dataType:'json',
            success:res=>{
              wx.showToast({
                title: '拼图成功',
                icon: 'success',
                duration: 2000
              })
              setTimeout(()=>{
                this.showModal()
              }, 1500)
            }
          })
        }

        this.setData({
          radioSelect: radioSelectData,
          sTwo: e.currentTarget.dataset.vid,
          clickFlag: 0
        })
      }

    }
  },
  randomAct(){
    var _this = this
    // 将grid随机打乱
    var arr = this.data.radioSelect
    arr = this.shuffle(arr)
   
    // 将top,left顺序分配到grid
    var posData = this.data.positionArr
    for(var i = 0;i<posData.length;i++){
      arr[i].top = posData[i].top
      arr[i].left = posData[i].left
    }

    // 存储一套id正确顺序时候top
    var trueTL = []
    var rowNo = Math.sqrt(this.data.radioSelectNo)
    for(var m = 0;m<arr.length;m++){
      var _id = arr[m].id
      var _top = (_id+1)%rowNo
      var _left = _id%rowNo
      var trueItem = {
        top: 240 / rowNo * this.rowCount(_id, rowNo) + 'px',
        left: 240 / rowNo * _left + 'px',
      }
      trueTL.push(trueItem)
    }
    
    // console.log(arr,trueTL)
    setTimeout(()=>{
      _this.setData({
        saveTL: trueTL,
        radioSelect:arr
      })
    }, 2000)
  },
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
  rowCount(j, rowNo) {
    var rowCount = 1
    switch (rowNo) {
      case 3:
        if (j < 3) {
          rowCount = 0
        } else if (j >= 3 && j < 6) {
          rowCount = 1
        } else if (j >= 6) {
          rowCount = 2
        }
        break;
      case 4:
        if (j < 4) {
          rowCount = 0
        } else if (j >= 4 && j < 8) {
          rowCount = 1
        } else if (j >= 8 && j < 12) {
          rowCount = 2
        } else if (j >= 12 && j < 16) {
          rowCount = 3
        }
        break;
      case 5:
        if (j < 5) {
          rowCount = 0
        } else if (j >= 5 && j < 10) {
          rowCount = 1
        } else if (j >= 10 && j < 15) {
          rowCount = 2
        } else if (j >= 15 && j < 20) {
          rowCount = 3
        } else if (j >= 20 && j < 25) {
          rowCount = 4
        }
        break;
    }
    return rowCount
  },
  shuffle(arr) {
    var i,
      j,
      temp;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  },
  goHome(){
    wx.navigateTo({
      url: '../index/index',
    })
  },
  goShare(){
    wx.navigateTo({
      url: '../sharePk/sharePk',
    })
  },
  withDraw(){
    var withdraw = this.data.withdraw
    this.setData({
      withdraw:!withdraw
    })
  }
})