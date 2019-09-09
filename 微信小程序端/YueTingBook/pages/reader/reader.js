// pages/reader/reader.js
const navigationBarHeight = (getApp().statusBarHeight + 44) + 'px'
var util = require('../../utils/util.js')
var touchDot = 0;//触摸时的原点 
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动 
var interval = "";// 记录/清理时间记录 
/**
* 计算总页数函数，需要理解行高---line-height和字体大小font-size之间的关系，可以查考http://www.jianshu.com/p/f1019737e155，以及http://www.w3school.com.cn/cssref/pr_dim_line-height.asp
* @param str 需要分页的内容
* @param fontSize 当前的字体大小
* @param lineHeight 当前的行高
* @param windowW 当前window的宽度
* @param windowH 当前window的高度
* @param pixelRatio 当前分辨率，用来将rpx转换成px
*/
function countPageNum(str, fontSize, lineHeight, windowW, windowH, pixelRatio) {
  var returnNum = 0;
  fontSize = fontSize;
  lineHeight = lineHeight;
  //将str根据‘\n’截成数组
  var strArray = str.split(/\n+/);
  var splitArray = [];//换行符的个数集合
  var reg = new RegExp('\n+', 'igm');
  var result = '';
  //这里写一个for循环去记录每处分隔符的\n的个数，这将会影响到计算换行的高度
  while ((result = reg.exec(str)) != null) {
    splitArray.push(result.toString().match(/\n/img).length);
  }
  var totalHeight = 0;
  strArray.forEach(function (item, index) {
    var wrapNum = 0;
    //splitArray的长度比strArray小1
    if (splitArray.length < index) {
      wrapNum = splitArray[index] - 1;
    }
    //Math.ceil向上取整
    totalHeight += Math.ceil(item.length / Math.floor((windowW - 120 / pixelRatio) / fontSize)) * lineHeight + wrapNum * lineHeight;

  });
  return Math.ceil(totalHeight / windowH) + 1;
}

/**---------------------------------------------------------------------------- */
Page({
  data: {
    navigationBarTitle: '标题',
    navigationBarHeight: navigationBarHeight,
    scroll_top: 0,
    scroll_height: 0,
    //serialNumber:1,//章节号，无用
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
    windows: { windowsHeight: 0, windowsWidth: 0, pixelRatio: 1 },
  },
  onReady: function () {
    var that = this;
    
  },
  onLoad: function (options) {
    var isFirst = options.isFirst;
    var pageIndex = parseInt(options.pageIndex);
    var that = this;
    //获取屏幕的高度和宽度，为分栏做准备
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        that.setData({
          windows: {
            windowsHeight: res.windowHeight - 68,
            windowsWidth: res.windowWidth,
            pixelRatio: res.pixelRatio,
            //scroll_height: res.windowHeight
          }
        });
      }
    }); 
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
    that.initChapter(1,1,true);
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
  





  //上一页下一页
  lastPage: function () {
    this.setData({
      Text: '上一页测试',
      scroll_top: 0
    })
  },
  nextPage: function () {
    this.setData({
      Text: '下一页测试',
      scroll_top: 0
    })
  },
  // 触摸开始事件 
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点 
    // 使用js计时器记录时间  
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸移动事件 
  touchMove: function (e) {
    var touchMove = e.touches[0].pageX;
    //console.log("touchMove:" + touchMove + " touchDot:" + touchDot + " diff:" + (touchMove - touchDot));
    // 向左滑动  
    if (touchMove - touchDot <= -40 && time < 10) {
      // wx.switchTab({
      //   url: '../左滑页面/左滑页面'
      // });
      console.log("left")
      this.setData({
        Text: '左滑测试',
        scroll_top: 0
      })
    }
    // 向右滑动 
    if (touchMove - touchDot >= 40 && time < 10) {
      console.log('right');
      // wx.switchTab({
      //   url: '../右滑页面/右滑页面'
      // });
      this.setData({
        Text: '右滑测试',
        scroll_top: 0
      })
    }
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    clearInterval(interval); // 清除setInterval 
    time = 0;
  },

  //获取文章
  initChapter: function (url, loadPageIndex) {
    var that = this;
    var pageindex = 1;
    if (loadPageIndex) {
      pageindex = that.data.pageIndex;
    }
    that.setData({
      Text: "",
    });
    try {
      var content = that.data.Text.trim();
      content = content.replace("\n\n", "\n");
      //content = content.replace("&emsp;&emsp;", "&emsp;");
      var name = (that.data.chapter || '').trim();
      var pageNum = countPageNum(content, parseInt(that.data.initFontSize), parseInt(that.data.initLineHeight), that.data.windows.windowsWidth, that.data.windows.windowsHeight, that.data.windows.pixelRatio);
      var width = that.data.windows.windowsWidth;
      var leftValue = width * (pageindex - 1)
      //重新排版
      that.setData({
        Text: content,
        chapter: name,
        //serialNumber: parseInt(serialNumber),
        pageNum: pageNum,
        pageIndex: pageindex,
      });
    } catch (e) {
      console.log(e);
    }
  },
})
