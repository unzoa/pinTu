// pages/wx-cropper/index.js
// 手机的宽度
var windowWRPX = 750
var winH = wx.getSystemInfoSync().windowHeight
var winW = wx.getSystemInfoSync().windowWidth
// 拖动时候的 pageX
var pageX = 0
// 拖动时候的 pageY
var pageY = 0

var pixelRatio = wx.getSystemInfoSync().pixelRatio

// 调整大小时候的 pageX
var sizeConfPageX = 0
// 调整大小时候的 pageY
var sizeConfPageY = 0

var initDragCutW = 0
var initDragCutL = 0
var initDragCutH = 0
var initDragCutT = 0

// 移动时 手势位移与 实际元素位移的比
var dragScaleP = 2

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageSrc: '/assets/imgs/b.jpg',
    returnImage: '',
    isShowImg: false,
    // 初始化的宽高
    cropperInitW: windowWRPX,
    cropperInitH: windowWRPX,
    // 图片方向
    wOrH: 0,
    // 动态的宽高
    cropperW: windowWRPX,
    cropperH: windowWRPX,
    // 动态的left top值
    cropperL: 0,
    cropperT: 0,

    // 图片缩放值
    scaleP: 0,
    imageW: 0,
    imageH: 0,

    // 裁剪框 宽高
    cutW: 0,
    cutH: 0,
    cutL: 0,
    cutT: 0,
  },
  onLoad(options){
      console.log(options.pic)
      this.setData({
        imageSrc: options.pic
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var _this = this
    
    wx.showLoading({
      title: '图片加载中...',
    })

    wx.getImageInfo({
      src: _this.data.imageSrc,
      success: function success(res) {
        var innerAspectRadio = res.width / res.height;
        // 根据图片的宽高显示不同的效果   保证图片可以正常显示
        if (innerAspectRadio >= 1) {
          // 横向
          // console.log(res.height * winW / res.width, res.height, res.width, winW)
          _this.setData({
            wOrH:1,
            cropperW: windowWRPX,
            cropperH: windowWRPX / innerAspectRadio,
            // 初始化left right
            cropperL: Math.ceil((windowWRPX - windowWRPX) / 2),
            cropperT: Math.ceil((windowWRPX - windowWRPX / innerAspectRadio) / 2),
            // 裁剪框  宽高  
            cutW: windowWRPX / innerAspectRadio - 200,
            cutH: windowWRPX / innerAspectRadio - 200,
            cutL: Math.ceil((windowWRPX - windowWRPX + 200) / 2),
            cutT: Math.ceil((windowWRPX / innerAspectRadio - (windowWRPX / innerAspectRadio - 200)) / 2),
            // 图片缩放值
            scaleP: res.width * pixelRatio / windowWRPX,
            // 图片原始宽度 rpx
            imageW: res.width * pixelRatio,
            imageH: res.height * pixelRatio
          })
        } else {
          _this.setData({
            wOrH: 2,
            cropperW: windowWRPX * innerAspectRadio,
            cropperH: windowWRPX,
            // 初始化left right
            cropperL: Math.ceil((windowWRPX - windowWRPX * innerAspectRadio) / 2),
            cropperT: Math.ceil((windowWRPX - windowWRPX) / 2),
            // 裁剪框的宽高
            cutW: windowWRPX * innerAspectRadio - 50,
            cutH: windowWRPX * innerAspectRadio - 50,//200,
            cutL: Math.ceil((windowWRPX * innerAspectRadio - (windowWRPX * innerAspectRadio - 50)) / 2),
            cutT: 0,//Math.ceil((windowWRPX - 200) / 2),
            // 图片缩放值
            scaleP: res.width * pixelRatio / windowWRPX,
            // 图片原始宽度 rpx
            imageW: res.width * pixelRatio,
            imageH: res.height * pixelRatio
          })
        }
        _this.setData({
          isShowImg: true
        })
        wx.hideLoading()
      }
    })
  },

  // 拖动时候触发的touchStart事件
  contentStartMove (e) {
    pageX = e.touches[0].pageX
    pageY = e.touches[0].pageY
  },

  // 拖动时候触发的touchMove事件
  contentMoveing (e) {
    var _this = this
    // _this.data.cutL + (e.touches[0].pageX - pageX)
    // console.log(e.touches[0].pageX)
    // console.log(e.touches[0].pageX - pageX)
    var dragLengthX = (pageX - e.touches[0].pageX) * dragScaleP
    var dragLengthY = (pageY - e.touches[0].pageY) * dragScaleP
    var minX = Math.max(_this.data.cutL - (dragLengthX), 0)
    var minY = Math.max(_this.data.cutT - (dragLengthY), 0)
    var maxX = _this.data.cropperW - _this.data.cutW
    var maxY = _this.data.cropperH - _this.data.cutH
    this.setData({
      cutL: Math.min(maxX, minX),
      cutT: Math.min(maxY, minY),
    })
    console.log(`${maxX} ----- ${minX}`)
    pageX = e.touches[0].pageX
    pageY = e.touches[0].pageY
  },

  // 获取图片
  getImageInfo () {
    var _this = this
    wx.showLoading({
      title: '图片生成中...',
    })
    wx.downloadFile({
      url: _this.data.imageSrc, //仅为示例，并非真实的资源
      success: function (res) {
        console.log(res)
        // 将图片写入画布
        const ctx = wx.createCanvasContext('myCanvas')
        ctx.drawImage(res.tempFilePath)
        ctx.draw()
        // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题
        var canvasW = _this.data.cutW / _this.data.cropperW * _this.data.imageW / pixelRatio
        var canvasH = _this.data.cutH / _this.data.cropperH * _this.data.imageH / pixelRatio
        var canvasL = _this.data.cutL / _this.data.cropperW * _this.data.imageW / pixelRatio
        var canvasT = _this.data.cutT / _this.data.cropperH * _this.data.imageH / pixelRatio
        console.log(`canvasW:${canvasW} --- canvasH: ${canvasH} --- canvasL: ${canvasL} --- canvasT: ${canvasT} -------- _this.data.imageW: ${_this.data.imageW}  ------- _this.data.imageH: ${_this.data.imageH}`)

        // 延时处理
        setTimeout(()=>{
          wx.canvasToTempFilePath({
            x: canvasL,
            y: canvasT,
            width: canvasW,
            height: canvasH,
            destWidth: canvasW,
            destHeight: canvasH,
            canvasId: 'myCanvas',
            success: function (res) {
              wx.hideLoading()
              // 成功获得地址的地方
              console.log(res.tempFilePath)

              // wx.previewImage({
              //   current: '', // 当前显示图片的http链接
              //   urls: [res.tempFilePath] // 需要预览的图片http链接列表
              // })

              wx.navigateTo({
                url: '../chooseGrid/chooseGrid?pic=' + res.tempFilePath,
              })

            }
          })
        }, 500)
      }
    })
  },

  // 设置大小的时候触发的touchStart事件
  dragStart(e) {
    var _this = this
    sizeConfPageX = e.touches[0].pageX
    sizeConfPageY = e.touches[0].pageY
    initDragCutW = _this.data.cutW
    initDragCutL = _this.data.cutL
    initDragCutT = _this.data.cutT
    initDragCutH = _this.data.cutH
  },

  // 设置大小的时候触发的touchMove事件
  dragMove (e) {
    var _this = this
    var dragType = e.target.dataset.drag
    var wOrH = this.data.wOrH
    switch (dragType) {
      case 'rightBottom':
      // 移动距离,移动小于0 说明是在放大
        var dragLengthX = (sizeConfPageX - e.touches[0].pageX) * dragScaleP
        var dragLengthY = (sizeConfPageY - e.touches[0].pageY)  * dragScaleP
        // console.log(initDragCutH, initDragCutW, dragLengthY, dragLengthX)
        // console.log(_this.data.cropperW, _this.data.cropperH, _this.data.cutH, _this.data.cutW)
        console.log(_this.data.cropperH > initDragCutT + _this.data.cutH)
        console.log(_this.data.cropperH , initDragCutT , _this.data.cutH)
        
        if (initDragCutH >= dragLengthY && initDragCutW >= dragLengthX) {
          // bottom 方向的变化
          if ((dragLengthY < 0 && _this.data.cropperH > initDragCutT + _this.data.cutH && wOrH == 1) || (dragLengthY > 0)) {
            this.setData({
              cutH: initDragCutW - dragLengthX,
              cutW: initDragCutW - dragLengthX
            })
          }
          // right 方向的变化
          if ((dragLengthX < 0 && _this.data.cropperW > initDragCutL + _this.data.cutW && wOrH == 2) || (dragLengthX > 0)) {
            this.setData({
              cutH: initDragCutH - dragLengthY,
              cutW: initDragCutH - dragLengthY
            })
          }
        } else {
          return
        }
        break;
    }
  },
})