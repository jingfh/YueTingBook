// pages/text2audio/text2audio.js
const recorderManager = wx.getRecorderManager();
Page({

  data: {
    speekerArray:[
      {  id: 0, name: '小燕_青年女声_普通话' },
      {  id: 1, name: '许久_青年男声_方言' },
      {  id: 2, name: '小萍_中年女声_普通话' },
      {  id: 3, name: '小婧_女声_方言' },
      {  id: 4, name: '许小宝_童音_童言' },
    ],
    speekerIndex:0,
    text:'',
    allValue:'',
    play: false,

    hint: "请在这里输入文本（不可超过200字）且语种要与选择的声种匹配",

    openRecordingdis: "block",//录音图片的不同
    shutRecordingdis: "none",//录音图片的不同
    recordingTimeqwe: 0,//录音计时
    setInter: "",//录音名称
    mp3File :""
  },

  onLoad: function (options) { },

  bindPickerChange: function (e) {
    console.log('speeker发生改变，携带值为', e.detail.value)
    this.setData({
      speekerIndex: e.detail.value
    })
  },

  //表单提交按钮
  formSubmit: function (e) {
    var that = this; 
    var alldata = e.detail.value;
    console.log('form发生了submit事件，携带数据为：', alldata);
    that.setData({
      text: alldata.inputText,
      allValue: alldata,
    });
   
    //转音频
    that.text2audio();
  },

  //text2audio
  text2audio: function(){
    var that = this;
    wx.request({
      url: 'http://localhost:89/tts/text2audio.ashx',
      data: {
        text: that.data.text,
        speeker: that.data.speekerIndex
      },
      method: 'POST',
      header: {
        //'content-type': 'application/json'
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        console.log("text2audio result:" + res.data);
        
        //播放
        that.playMusic(res.data);
        //暂停
        that.playMusic(res.data);
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  //audio2text
  audio2text: function(){
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
        console.log("2.audio2text result:" + res.data);
        
        var t = that.data.text;
        that.setData({
          hint:"",
          text: t + res.data,
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  //表单重置按钮
  formReset: function (e) {
    console.log('form发生了reset事件')
    this.setData({
      speekerIndex: 0,
      text: '',
      allValue: '',
    })
  },

  playMusic: function (url) { 
    var play = this.data.play;
    if (play) { 
      console.log("pause");
      wx.pauseBackgroundAudio(); 
      this.setData({ 
        play: false
      }) 
    } 
    else 
    { 
      this.recordplay(url);    
      this.setData({ 
        play: true 
      }) 
    }
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
      }
      , 1000);
  },


  //开始录音
  openRecording: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          shutRecordingdis: "block",
          openRecordingdis: "none"
        })
      }
    })
    const options = {
      duration: 60000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
      sampleRate: 16000, //采样率
      numberOfChannels: 2, //录音通道数
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

  //结束录音
  shutRecording: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          shutRecordingdis: "none",
          openRecordingdis: "block"
        })
      }
    })
    var loadimg = '../images/loading.gif';
    
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('。。停止录音。。', res.tempFilePath)
      const tempFilePath = res.tempFilePath;
      //结束录音计时  
      clearInterval(that.data.setInter);
      //若是
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
              //mp3File: data.LocalUrl,
              //mp3File: "http://iislocalserver.lab.com/audio/test.mp3"
            });

            //转文字
            that.audio2text();
            //播放
            that.recordplay(data.Url);

            

          },
          fail: function (ress) {
            console.log("。。录音保存失败。。");
          }
        })
      //}
      
    })
    

    
  },

  //录音播放
  recordplay: function (url) {
    wx.playBackgroundAudio({
      //播放地址
      dataUrl: url
    })
  },


})