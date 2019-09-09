// pages/search/search.js
const recorderManager = wx.getRecorderManager();
var WxSearch = require('../../libs/wxSearchView/wxSearchView.js');
var hot = ['斗破苍穹', '盗墓笔记', "灵域", "我欲封天", '龙族', "斗罗大陆","将夜","牧神记"];
var rel = ['斗破苍穹之无上之境', "斗破苍穹之药老传奇","斗罗大陆2：绝世唐门","斗罗大陆3：龙王传说","斗罗大陆4：终极斗罗",
  "武炼巅峰", "武极天下", "修罗武神","武动乾坤",
  '龙族1：火之晨曦', '龙族2：悼亡者之瞳', '龙族3：黑月之潮', '龙族4：奥丁之渊', '龙族5：悼亡者的归来',];
Page({
  data: {
    navigationBarTitle: '小说搜索',

    /*录音区域*/
    openRecordingdis: "block",//录音图片的不同
    shutRecordingdis: "none",//录音图片的不同
    recordingTimeqwe: 0,//录音计时
    setInter: "",//录音名称
    mp3File: "",
    //text:'',
  },
  onLoad: function (options) {
    var that = this;
    WxSearch.init(
      that,  
      hot, //热点搜索推荐
      rel,//搜索匹配
      that.mySearchFunction,
      that.myGobackFunction,
      that.openRecording,
      that.shutRecording,
      that.data.openRecordingdis,
      that.data.shutRecordingdis,
    );
  },
  wxSearchInput: WxSearch.wxSearchInput,  //输入变化时的操作
  wxSearchInputByRecord: WxSearch.wxSearchInputByRecord,
  wxSearchKeyTap: WxSearch.wxSearchKeyTap,  //点击提示或者关键字、历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, //删除所有的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm,  //搜索
  wxSearchClear: WxSearch.wxSearchClear,  //清空搜索历史
  changeRecordBgImg: WxSearch.changeRecordBgImg,//改变录音背景

  //搜索  
  mySearchFunction: function (value) {
    wx.reLaunch({
      url: '../searchbaidu/searchbaidu?keyword='+value
    })
  },

  //返回
  myGobackFunction: function () {
    wx.reLaunch({
      url: '../../pages/index/index'
    })
  },






  //audio2text
  audio2text: function () {
    var that = this;
    wx.request({
      url: 'http://localhost:89/iat/audio2text.ashx',
      data: {
        file: that.data.mp3File
      },
      method: 'POST',
      header: {
        //'content-type': 'application/json'
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        console.log("iat result:" + res.data);
        //var t = that.data.text;
        //that.setData({
          //text: t + res.data,
        //});
        that.wxSearchInputByRecord(res.data);
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  //录音计时器
  recordingTimer: function () {
    var that = this;
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function () {
        var time = that.data.recordingTimeqwe + 1;
        that.setData({
          recordingTimeqwe: time
        })
      }, 1000);
  },

  /*
  * 开始录音
  */
  openRecording: function () {
    var that = this;
    that.changeRecordBgImg();
    const options = {
      duration: 60000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    }
    //开始录音计时   
    that.recordingTimer();
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('。。。开始录音。。。')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },
  /*
  * 结束录音
  */
  shutRecording: function () {
    var that = this;
    that.changeRecordBgImg();
    var loadimg = '../images/loading.gif';

    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('。。停止录音。。', res.tempFilePath)
      const tempFilePath = res.tempFilePath;
      //结束录音计时  
      clearInterval(that.data.setInter);
      /*
      if (that.data.recordingTimeqwe < 350) {
        wx.showToast({
          title: '说话时间太短',
          icon: 'none',
        })
      }
      */
      //else {
      wx.showLoading({
        title: '录音上传中...',
        image: loadimg
      });
      //上传录音
      wx.uploadFile({
        url: "http://iislocalserver.lab.com:90/upload/IISLocalServer.ashx",//这是你自己后台的连接
        filePath: tempFilePath,
        name: "file",//后台要绑定的名称
        header: {
          "Content-Type": "multipart/form-data"
        },
        //参数绑定
        formData: {
        },
        success: function (ress) {
          wx.hideLoading();
          var data = JSON.parse(ress.data);
          console.log(ress.data);
          wx.showToast({
            title: '保存完成',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            mp3File: data.Url,
          });
          //转文字
          that.audio2text();
        },
        fail: function (ress) {
          console.log("。。录音保存失败。。");
        }
      })
      //}
    })
  },

})