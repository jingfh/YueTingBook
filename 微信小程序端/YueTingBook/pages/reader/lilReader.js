// pages/reader/lilReader.js
/*
* 2019.08.22
* 第二版 添加目录
*/
const back = wx.getBackgroundAudioManager();
const navigationBarHeight = (getApp().statusBarHeight + 44) + 'px';
Page({
  data: {
    speekerArray: [//发声人Array
      { id: 0, name: '小燕_青年女声_普通话' },
      { id: 1, name: '许久_青年男声_方言' },
      { id: 2, name: '小萍_中年女声_普通话' },
      { id: 3, name: '小婧_女声_方言' },
      { id: 4, name: '许小宝_童音_童言' },
    ],
    speekerIndex: 0,//发声人Index
    picker: 'none',//picker？
    play:false,//播放？
    playUrl:"",//播放 Url
    hasPlay:false,//控制播放次数
    lastTapTime: 0,

    navigationBarTitle: '书名',//顶部导航栏-标题
    navigationBarHeight: navigationBarHeight,//顶部导航栏-高度
    scroll_top: 0,
    windows: { windowsHeight: 0, windowsWidth: 0, pixelRatio: 1 },//
    initFontSize: '14',//字号
    initLineHeight: '18',//行距
    colorArr: [{
      value: '#f7eee5',
      name: '米白',
      font: ''
    }, {
      value: '#e9dfc7',
      name: '纸张',
      font: '',
      id: "font_normal"
    }, {
      value: '#a4a4a4',
      name: '浅灰',
      font: ''
    }, {
      value: '#cdefce',
      name: '护眼',
      font: ''
    }, {
      value: '#283548',
      name: '灰蓝',
      font: '#7685a2',
      bottomcolor: '#fff'
    }, {
      value: '#0f1410',
      name: '夜间',
      font: '#4e534f',
      bottomcolor: 'rgba(255,255,255,0.7)',
      id: "font_night"
    }],
    nav: 'none',//最底部工具栏
    ziti: 'none',//中部工具栏
    curcolor: 1,
    bodyColor: '#e9dfc7',
    daynight: false,
    lastnext: 'none',

    pageIndex: 1,//暂时作为目录分页的当前页号
    pageNum: 1,//暂时作为目录分页的总页数
    bookUrl: '',//书 Url
    bookId: '',//书 Id
    chapter: "章节名",//
    chapterNo : "",//
    chapters:[], //章节
    Text: "正文",//
    Context: "正文",
    showCatelog: false,//目录显示？
  },
  onReady: function () {
    var that = this;
    //获取屏幕的高度和宽度，为分栏做准备
    wx.getSystemInfo({
      success: function (res) {
        that.setData({ 
          windows: { 
            windowsHeight: res.windowHeight - 20, 
            windowsWidth: res.windowWidth, 
            pixelRatio: res.pixelRatio 
          } 
        });
      }
    });
  },
  onLoad: function () {
    var that = this;
    //获取bookUrl
    try {
      var thisUrl = wx.getStorageSync('curUrl');
      if (thisUrl) {
        //console.log("获取成功 curUrl=" + thisUrl);
        that.setData({
          bookUrl: thisUrl
        })
      }
    } catch (e) {
      console.log(e);
    }
    //获取bookId
    try {
      var thisBook = wx.getStorageSync('curBook');
      if (thisBook) {
        //console.log("获取成功 curBook=" + thisBook);
        that.setData({
          bookId: thisBook
        })
      }
    } catch (e) {
      console.log(e);
    }
    //获取阅读设置
    wx.getStorage({
      key: 'initFontSize',
      success: function (res) {
        that.setData({
          initFontSize: res.data
        })
      }
    });
    wx.getStorage({
      key: 'initLineHeight',
      success: function (res) {
        that.setData({
          initLineHeight: res.data
        })
      }
    });
    wx.getStorage({
      key: 'bodyColor',
      success: function (res) {
        that.setData({
          bodyColor: res.data
        })
      }
    });
    wx.getStorage({
      key: 'curcolor',
      success: function (res) {
        that.setData({
          curcolor: res.data
        })
      }
    });
    wx.getStorage({
      key: 'daynight',
      success: function (res) {
        that.setData({
          daynight: res.data
        })
      }
    });
    //load章节数据接口
    that.initChapter(that.data.bookUrl);
    //load目录数据接口
    //that.initCatelog(that.data.bookId);
  },
  //初始化文章
  initChapter: function (url) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log("BookUrl="+url);
    wx.request({
      url: 'http://localhost:88/crawler/Crawl.aspx',
      data:{
        Url:url,
      },
      method: 'POST',
      header: {
        //'content-type': 'application/json'
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        console.log(res.data);
        //console.log("Chapter:" + res.data.Chapter);
        //console.log("Context:" + res.data.Context);
        //var book = res.data.Book.trim();
        var book = res.data.Book;  
        var content = res.data.Context;
        var chapter = res.data.Chapter;
        var chapterNo = parseInt(res.data.ChapterNo);
        //加一，38/30=1，第2页
        var menuIndex = parseInt(chapterNo / 30 + 1);
        //不采用四舍五入，38/30=2，第二页对，32/30=1，第二页错
        //var menuIndex = (chapterNo / 30 + 1).toFixed(0);
        //console.log("计算结果==="+menuIndex);
        if (content) {
          //防止Cannot read property 'replace' of null报错
          content = content.replace(/&emsp;&emsp;/g, '');
          var plaintext = content.replace(/ENTER/g, ' ');
          content = content.replace(/ENTER/g, '\n&emsp;&emsp;');
        }
        that.setData({
          Text: content,
          Context: plaintext,
          chapter: chapter,
          navigationBarTitle: book,
          chapterNo: chapterNo,
          pageIndex: menuIndex,
        });
        //console.log(content);
        //load目录数据接口
        that.initCatelog(that.data.bookId);
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    });
    
  },
  //转到章节
  toReader: function (e) {
    var that = this;
    //更新音频状态,播放，则使其stop
    that.setData({
      hasPlay: false,
    })
    that.audioStop();
    
    //刷新页面
    let chapterUrl = 1;
    console.log(e.currentTarget.dataset);
    if (e.currentTarget.dataset.url) {
      chapterUrl = e.currentTarget.dataset.url;
    }
    that.initChapter(chapterUrl);
    //更新当前章节缓存
    wx.setStorageSync('curUrl', chapterUrl);
    try {
      var thisUrl = wx.getStorageSync('curUrl');
      if (thisUrl) {
        console.log("通过目录设置chapterUrl成功 curUrl=" + thisUrl);
      }
    } catch (e) {
      console.log(e);
    }

    //隐藏目录
    that.setData({
      showCatelog: false
    });
    
    that.setData({
      bookUrl: chapterUrl,
    });
  },
  //初始化目录
  initCatelog: function (id) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log("BookId=" + id);
    wx.request({
      url: 'http://localhost:88/crawler/MenuCrawler.aspx',
      data: {
        BookId: id,
        PageIndex:that.data.pageIndex,
      },
      method: 'POST',
      header: {
        //'content-type': 'application/json'
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        console.log(res.data);
        //console.log("PageNum:" + res.data.PageNum);
        //console.log("ChapterNames:" + res.data.ChapterNames);
        var pageNum = res.data.PageNum;
        var chapters = res.data.ChapterNames;
        var chapts = [];
        for (var i = 0; i < Object.keys(chapters).length;i++){
          chapts.push({
            No: chapters[i+1][0],
            Url: chapters[i+1][1],
            Name: chapters[i+1][2],
          });
        }
        //var cNo = that.data.chapterNo;
        that.setData({
          //pageNum: pageNum,
          chapters: chapts,
          //解决scroll-into-view无效的问题
          chapterNo: that.data.chapterNo
        });
        if (pageNum!=null){
          that.setData({
            pageNum: parseInt(pageNum)
          });
        }
        //
        //console.log("重构后的章节");
        //console.log(that.data.chapters);
        //console.log(that.data.colorArr);
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    });
  },
  //next下一页
  nextPage: function(){
    var that = this;
    var next = that.data.pageIndex + 1;
    if(next <= that.data.pageNum){
      that.setData({
        pageIndex : next
      });
      that.initCatelog(that.data.bookId);
    }
    else{
      wx.showToast({
        title: '已经是最后一页目录',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //last上一页
  lastPage: function(){
    var that = this;
    var last = that.data.pageIndex - 1;
    if (last > 0){
      that.setData({
        pageIndex : that.data.pageIndex - 1
      });
      that.initCatelog(that.data.bookId);
    }
    else{
      wx.showToast({
        title: '已经是第一页目录',
        icon: 'none',
        duration: 2000
      })
    }
  },

  

  //字体变大
  bindBig: function () {
    var that = this;
    if (that.data.initFontSize > 19) {
      return;
    }
    var FontSize = parseInt(that.data.initFontSize)
    that.setData({
      initFontSize: FontSize += 1
    })
    wx.setStorage({
      key: "initFontSize",
      data: that.data.initFontSize
    })
  },
  //字体变小
  bindSmall: function () {
    var that = this;
    if (that.data.initFontSize < 11) {
      return;
    }
    var FontSize = parseInt(that.data.initFontSize)
    that.setData({
      initFontSize: FontSize -= 1
    })
    wx.setStorage({
      key: "initFontSize",
      data: that.data.initFontSize
    })
  },
  //行距变大
  bindAdd: function () {
    var that = this;
    if (that.data.initLineHeight > 24) {
      return;
    }
    var LineHeight = parseInt(that.data.initLineHeight)
    that.setData({
      initLineHeight: LineHeight += 1
    })
    wx.setStorage({
      key: "initLineHeight",
      data: that.data.initLineHeight
    })
  },
  //行距变小
  bindSub: function () {
    var that = this;
    if (that.data.initLineHeight < 16) {
      return;
    }
    var LineHeight = parseInt(that.data.initLineHeight)
    that.setData({
      initLineHeight: LineHeight -= 1
    })
    wx.setStorage({
      key: "initLineHeight",
      data: that.data.initLineHeight
    })
  },




  //点击中间区域显示底部导航
  midaction: function () {
    if (this.data.nav == 'none') {
      this.setData({
        nav: 'block',
        lastnext: 'block',
      })
    } else {
      this.setData({
        nav: 'none',
        ziti: 'none',
        lastnext: 'none'
      })

    }
  },
  //点击字体出现窗口
  zitiaction: function () {
    if (this.data.ziti == 'none') {
      this.setData({
        ziti: 'block',
        lastnext: 'none'
      })
    } else {
      this.setData({
        ziti: 'none',
        lastnext: 'block',
      })
    }
  },
  //点击目录/点击目录右侧
  changeShowCatelog: function(){
    //console.log("发生了点击显示目录事件");
    var that = this;
    if(that.data.nav == 'block'){
      that.setData({
        nav: 'none',
      })
    }
    if (that.data.ziti == 'block') {
      that.setData({
        ziti: 'none',
      })
    }
    that.setData({
      showCatelog: !that.data.showCatelog
    })
    
  },
  //选择背景色
  bgChange: function (e) {
    // console.log(e.target.dataset.num)
    // console.log(e)
    this.setData({
      curcolor: e.target.dataset.num,
      bodyColor: this.data.colorArr[e.target.dataset.num].value
    })
    wx.setStorage({
      key: "bodyColor",
      data: this.data.colorArr[e.target.dataset.num].value
    })
    wx.setStorage({
      key: "curcolor",
      data: e.target.dataset.num
    })
  },
  //切换白天夜晚
  dayNight: function () {
    if (this.data.daynight == true) {
      this.setData({
        daynight: false,
        bodyColor: '#e9dfc7',
        curcolor: 1
      })
      wx.setStorage({
        key: "bodyColor",
        data: '#e9dfc7'
      })
      wx.setStorage({
        key: "curcolor",
        data: 1
      })

    } else {
      this.setData({
        daynight: true,
        bodyColor: '#000',
        curcolor: 5
      })
      wx.setStorage({
        key: "bodyColor",
        data: '#000'
      })
      wx.setStorage({
        key: "curcolor",
        data: 5
      })
    }
    wx.setStorage({
      key: "daynight",
      data: this.data.daynight
    })
  },







  //语音播放事件
  playNow: function(e){
    var that = this;
    //双击监听
    var curTime = e.timeStamp
    var lastTime = e.currentTarget.dataset.time
    //console.log(lastTime)
    if (curTime - lastTime > 0) {
      if (curTime - lastTime < 300) {
        if (that.data.picker == 'none') {
          that.setData({
            picker: 'block'
          });
        }
        else{
          that.setData({
            picker: 'none'
          });
        }
      }
    }
    this.setData({
      lastTapTime: curTime
    })
    //开始处理
    if(!that.data.hasPlay){
      //没请求过tts，转音频，并停止当前音频
      //console.log("开始朗读");
      that.audioStop();
      that.text2audio();
    }else{
      //控制播放
      that.playControl();
    }
  },
  //控制
  playControl:function(){
    var that = this;
    var play = this.data.play;
    if (play) {
      //暂停
      that.playPause();
    }
    else{
      //播放
      that.playPause();
    }
  },
  //text2audio
  text2audio: function () {
    var that = this;
    var plaintext = that.data.Context;
    //console.log("开始tts,原文是"+plaintext);
    wx.request({
      url: 'http://localhost:89/tts/text2audio.ashx',
      data: {
        text: plaintext,
        speeker: that.data.speekerIndex
      },
      method: 'POST',
      header: {
        //'content-type': 'application/json'
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        console.log("text2audio result:" + res.data);
        that.setData({
          playUrl: res.data,
          play:true,
          hasPlay:true,
        });
        //播放
        console.log("开始朗读");
        back.src = that.data.playUrl;
        back.epname = that.data.playUrl;
        back.singer = that.data.chapter;
        back.title = that.data.navigationBarTitle;
        back.coverImgUrl = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1566575124218&di=33d150867d8c87027c7ee4cddfc1d0d8&imgtype=0&src=http%3A%2F%2Fdpic.tiankong.com%2Fu7%2Fi2%2FQJ8574052741.jpg";
        that.audioPlay();
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  //播放or暂停
  playPause: function () {
    var play = this.data.play;
    if (play) {
      back.pause();
      back.onPause(() => {
        console.log("播放暂停");
      })
      this.setData({
        play: false
      })
    }
    else {
      this.audioPlay();
      this.setData({
        play: true
      })
    }
  },
  //停止
  audioStop: function(){
    var play = this.data.play;
    if (play) {
      back.stop();
      back.onStop(() => {
        console.log("播放停止");
      })
      this.setData({
        play: false,
        //hasPlay:false,
      })
    }
    else {
      //不管
    }
  },
  //暂停
  audioPause: function () {
    var play = this.data.play;
    if (play) {
      back.pause();
      back.onPause(() => {
        console.log("播放暂停");
      })
      this.setData({
        play: false
      })
    }
    else {
      //不管
    }
  },
  //音频播放
  audioPlay: function () {
    //back.src = url;
    back.play();
    back.onPlay(() => {
      console.log("播放开始");
    })
    back.onEnded(() => {
      console.log("播放结束");
    });
  },
  //选择发声人
  bindPickerChange: function (e) {
    var that = this;
    console.log('speeker发生改变，携带值为', e.detail.value)
    var curSpeeker = that.data.speekerIndex;
    var newSpeeker = e.detail.value
    if (newSpeeker != curSpeeker){
      that.setData({
        speekerIndex: newSpeeker,
        hasPlay: false,
      })
    }
    //更新播放状态,播放则暂停,暂停则不管
    that.audioPause();
  },







  //滚动隐藏窗口
  scrollContain: function () {
    this.setData({
      nav: 'none',
      ziti: 'none',
      lastnext: 'none'
    })
  },
  //滚动到底部
  bindscrolltolower: function () {
    this.setData({
      lastnext: 'block',
    })
    console.log("触发了滑动到底部事件");
  },
  
  
})
