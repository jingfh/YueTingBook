//index.js
// 引用百度地图微信小程序JSAPI模块 
var bmap = require('../../libs/bmap-wx/bmap-wx.js');
//获取应用实例
const app = getApp()
var timeutil = require('../../utils/util.js');
//var clock = require('../clock/clock.js');
Page({
  data: {
    motto: 'Hello World!',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    weatherData: '',
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this;
    //let inst = this;
    //instance.log1 = new clock(inst);

    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'r4ImGRSaD067aFZsjx2Dcm9mP323TMHF'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      var weatherData = data.currentWeather[0];
      weatherData = 
      '城市：' + weatherData.currentCity + '\n' + 
      'PM2.5：' + weatherData.pm25 + '\n' + 
      '日期：' + weatherData.date + '\n' + 
      '温度：' + weatherData.temperature + '\n' + 
      '天气：' + weatherData.weatherDesc + '\n' + 
      '风力：' + weatherData.wind + '\n';
      that.setData({
        weatherData: weatherData
      });
    }
    // 发起weather请求 
    BMap.weather({
      fail: fail,
      success: success
    });



    var time = timeutil.formatTime(new Date());
    this.setData({
      curtime: time,
    });


    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
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
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
