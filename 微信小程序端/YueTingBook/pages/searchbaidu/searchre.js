// pages/searchbaidu/searchre.js
Page({
  onLoad: function (options) {
    console.log(" 跳转 =>=>=> " + '../searchbaidu/searchbaidu?url=' + options.url);
    if (options.url != null && options.keyword == null) {
      wx.reLaunch({
        url: '../searchbaidu/searchbaidu?url=' + options.url
      })
    }
    if (options.keyword != null && options.url == null) {
      wx.reLaunch({
        url: '../searchbaidu/searchbaidu?keyword=' + options.keyword
      })
    }
    if (options.keyword == null && options.url == null) {
      wx.reLaunch({
        url: '../searchbaidu/searchbaidu'
      })
    }
  },
  
})