// pages/led/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    days: [
      [0, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 1]
    ],
    hours: [
      [0, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 1]
    ],
    minutes: [
      [0, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 1]
    ],
    seconds: [
      [0, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 1]
    ],
    Millisecond: [
      [0, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 1]
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var digitSegments = [
      [1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 1],
      [1, 1, 1, 1, 0, 0, 1],
      [0, 1, 1, 0, 0, 1, 1],
      [1, 0, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 0, 1, 1],
    ];
    setInterval(function () {
      // 时钟效果开始
      var date = new Date();
      var days = date.getDate(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds(),
        Millisecond = Math.floor(date.getMilliseconds() / 10);
      // 时钟效果结束
      let _days = [];
      let _hours = [];
      let _minutes = [];
      let _seconds = [];
      let _Millisecond = [];
      _days[0] = digitSegments[(Math.floor(days / 10))];
      _days[1] = digitSegments[(days % 10)];
      _hours[0] = digitSegments[(Math.floor(hours / 10))];
      _hours[1] = digitSegments[(hours % 10)];
      _minutes[0] = digitSegments[(Math.floor(minutes / 10))];
      _minutes[1] = digitSegments[(minutes % 10)];
      _seconds[0] = digitSegments[(Math.floor(seconds / 10))];
      _seconds[1] = digitSegments[(seconds % 10)];
      _Millisecond[0] = digitSegments[(Math.floor(Millisecond / 100))];
      _Millisecond[1] = digitSegments[(Millisecond % 10)];
      // console.log(days, _days);
      // console.log(seconds, _seconds);
      that.setData({
        days: _days,
        hours: _hours,
        minutes: _minutes,
        seconds: _seconds,
        Millisecond: _Millisecond
      });
    }, 10)
  },
})