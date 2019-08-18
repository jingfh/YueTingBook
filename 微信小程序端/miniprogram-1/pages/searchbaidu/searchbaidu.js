// pages/searchbaidu/searchbaidu.js
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword:'',
    url:'',
    isReadMode:false,
    isInsertTag:false,
    navigationBarTitle: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.showNavigationBarLoading();
    console.log(options);
    if (options.keyword != null && options.url == null){
      this.setData({
        keyword: options.keyword,
        navigationBarTitle: options.keyword,
      });
    }
    if (options.url != null && options.keyword == null) {
      this.setData({
        url: options.url ,
      });
    }
    if (options.url == null && options.keyword == null){
      this.setData({
        url: "https://so.88dush.com/search/index.php",
      });
    }
    //wx.hideNavigationBarLoading();
  },

  onReady: function () {},
  onShow: function () {
   /* var that = this;
    var test={
      keyword: that.data.keyword,
      re: that.data.re, 
      url: that.data.url,
    }
    that.onLoad(test); */
    //this.refreshWebview();
  },
  onHide: function () { },
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},

  onShareAppMessage: function (options) {
    //console.log(options);
  },

  messageShow : function(e){
    console.log(e.detail);
    var curUrl = e.detail.src;
    if (curUrl.substring(0, 20) == "https://m.88dush.com" ){
      if (curUrl.substring(21, 25) == "book" ){

        wx.setStorageSync('curUrl',curUrl);
        
        try {
          var thisUrl = wx.getStorageSync('curUrl');
          if (thisUrl) {
            console.log("设置成功 curUrl=" + thisUrl);
          }
        } catch (e) {
          console.log(e);
        }
      }
    } 
    else if (curUrl.substring(0, 21) != "https://so.88dush.com"){
      console.log("垃圾广告");
      try {
        var thisUrl = wx.getStorageSync('curUrl');
        if (thisUrl) {
          //console.log(" curUrl=" + thisUrl);
          wx.reLaunch({
            //url: '../searchbaidu/searchbaidu?url=' + thisUrl + '&sid=' + util.formatTime(new Date()),
            url: '../searchbaidu/searchre?url=' + thisUrl,
          })
        }/*else{
          wx.reLaunch({
            url: '../index/index',
          })
        }*/
      } catch (e) {
        console.log(e);
      }
      //wx.navigateBack();
    }
  },
  
  //卸载页面
  /*onUnload: function () {
    console.log("ONLOAD");
    //wx.navigateBack();
  },*/


  refreshWebview: function () {
    let tmpKeyword = this.data.keyword;
    let tmpUrl = this.data.url;
    this.setData({
      keyword: '',
      url: '',
    });
    setTimeout(() => {
      this.setData({
        keyword: tmpKeyword,
        url: tmpUrl
      })
    }, 100);
  }
})