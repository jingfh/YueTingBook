// pages/html/html.js
var WxParse = require('../../libs/wxParse/wxParse.js');
Page({
  data: {

  },
  onLoad: function (options) {
    var that =  this;
    var article = '<div>我是HTML代码<img src="http://image.chunshuitang.com/goods/401078.jpg"></img></div>';
    WxParse.wxParse('article', 'html', article, that, 5);   // 实例化对象
  },
  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {}
})