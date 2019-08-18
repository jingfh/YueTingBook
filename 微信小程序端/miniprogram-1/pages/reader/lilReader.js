// pages/reader/lilReader.js
const navigationBarHeight = (getApp().statusBarHeight + 44) + 'px'
Page({
  data: {
    navigationBarTitle: '书名',
    navigationBarHeight: navigationBarHeight,
    scroll_top: 0,
    chapter: "这是章节名123",
    Text: "正文",
    initFontSize: '14',
    initLineHeight: '18',
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
    nav: 'none',
    ziti: 'none',
    _num: 1,
    bodyColor: '#e9dfc7',
    daynight: false,
    lastnext: 'none',
    pageIndex:1,
    pageNum:1,
    bookUrl:'',
  },
  onReady:function(){
    var that = this;
    
  },
  onLoad: function () {
    var that = this;
    //获取bookUrl
    try {
      var thisUrl = wx.getStorageSync('curUrl');
      if (thisUrl) {
        console.log("获取成功 curUrl=" + thisUrl);
        that.setData({
          bookUrl: thisUrl
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
      key: '_num',
      success: function (res) {
        that.setData({
          _num: res.data
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
    //load文本数据接口
    that.initChapter(that.data.bookUrl);
  },
  //获取文章
  initChapter: function (url) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log("Url="+url);
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
        content = content.replace(/&emsp;&emsp;/g, '');
        content = content.replace(/ENTER/g, '\n&emsp;&emsp;');
        that.setData({
          Text: content,
          chapter: chapter,
          navigationBarTitle: book,
        });
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    });

    

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
  //选择背景色
  bgChange: function (e) {
    // console.log(e.target.dataset.num)
    // console.log(e)
    this.setData({
      _num: e.target.dataset.num,
      bodyColor: this.data.colorArr[e.target.dataset.num].value
    })
    wx.setStorage({
      key: "bodyColor",
      data: this.data.colorArr[e.target.dataset.num].value
    })
    wx.setStorage({
      key: "_num",
      data: e.target.dataset.num
    })
  },
  //切换白天夜晚
  dayNight: function () {
    if (this.data.daynight == true) {
      this.setData({
        daynight: false,
        bodyColor: '#e9dfc7',
        _num: 1
      })
      wx.setStorage({
        key: "bodyColor",
        data: '#e9dfc7'
      })
      wx.setStorage({
        key: "_num",
        data: 1
      })

    } else {
      this.setData({
        daynight: true,
        bodyColor: '#000',
        _num: 5
      })
      wx.setStorage({
        key: "bodyColor",
        data: '#000'
      })
      wx.setStorage({
        key: "_num",
        data: 5
      })
    }
    wx.setStorage({
      key: "daynight",
      data: this.data.daynight
    })
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
