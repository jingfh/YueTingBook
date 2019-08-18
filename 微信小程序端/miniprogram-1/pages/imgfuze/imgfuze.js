// pages/imgfuze/imgfuze.js
const ctx = wx.createCanvasContext('myCanvas');
var imagepath;
var fun = true;
Page({
  //获取分享图片地址
  onLoad: function (options) {
    if (options.path !== undefined) {
      imagepath = options.path;
      ctx.drawImage(imagepath, 0, 0, 240, 380);
      ctx.draw();
    }
  },

  //选择图片
  click: function (e) {
    wx.chooseImage({
      count: 1,
      success: function (res) {
        ctx.drawImage(res.tempFilePaths[0], 0, 0, 240, 380);
        ctx.draw();
      }
    })
  },

  //手指移动
  move: function (e) {
    //打马赛克
    if (fun) {
      ctx.setFillStyle('red');
      ctx.fillRect(e.touches[0].x, e.touches[0].y, 10, 10);
      ctx.fillRect(e.touches[0].x + 10, e.touches[0].y + 10, 10, 10);
      ctx.setFillStyle('pink');
      ctx.fillRect(e.touches[0].x + 10, e.touches[0].y, 10, 10);
      ctx.fillRect(e.touches[0].x, e.touches[0].y + 10, 10, 10);
      ctx.draw(true);
    }
    //擦除
    else {
      ctx.clearRect(e.touches[0].x, e.touches[0].y, 20, 20);
      ctx.draw(true);
    }
  }
  ,
  //按键切换
  clear: function (e) {
    fun = false;
  },
  cover: function (e) {
    fun = true;
  },
  //保存图片
  save: function (e) {
    console.log("保存");
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success(res) {
        imagepath = res.tempFilePath;
      }
    })
    console.log(imagepath);
  },



  //分享给好友
  onShareAppMessage: function () {
    return {
      title: '我的图片',
      desc: '',
      path: '/pages/imgfuze/imgfuze?path=' + imagepath
    }
  }



})
