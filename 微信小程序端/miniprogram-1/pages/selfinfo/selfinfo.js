// pages/selfinfo/selfinfo.js
var app = getApp();

Page({
  //页面的初始数据
  data: {
      pictures:[
        '../images/1.png',
        '../images/2.png',
        '../images/3.png',
      ],
      username:'这是用户名',
      //curtime:'',
      //servertime:'',

  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
   
  },
  //生命周期函数--监听页面初次渲染完成
  onReady: function () { },
  //生命周期函数--监听页面显示
  onShow: function () { },
  //生命周期函数--监听页面隐藏
  onHide: function () { },
  //生命周期函数--监听页面卸载
  onUnload: function () { },
  //页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () { },
  //页面上拉触底事件的处理函数
  onReachBottom: function () { },
  //用户点击右上角分享
  onShareAppMessage: function () { },

  //获取用户信息，并返回到表格
  getInfo:function(){
    var that = this;
    //var uname = '';
    wx.request({
      //url: app.globalData.ServerUrl + 'mall/user/do_get_info.do',
      //url: 'http://localhost:8080/mall/user/do_get_info.do',
      //url: 'http://localhost:88/Handler1.ashx',
      url: 'https://m.88dush.com/book/71526-42292500/',
      data: {
      },
      method: 'GET',
      header: {
        'content-type': 'application/json;charset=gbk' // 默认值
      },
      success: function (res) {
        //var data = JSON.parse(decodeURIComponent(JSON.stringify(res.data)))
        var data = util.hexStringToBuff(res.data);
        console.log(data);
        //$('#username').val(res.data);
        //uname = res.data;
        that.setData({ username: data });
      },
      fail: function (res) {
        console.log(".....get user info fail.....");
      }
    })
    //console.log()
  },
  //选择图片
  chooseImg:function(){
    var that = this;
    wx.chooseImage({
      // 设置最多可以选择的图片张数，默认9,如果我们设置了多张,那么接收时//就不在是单个变量了,
      count: 1,
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        // 获取成功,将获取到的地址赋值给临时变量
        var tempFilePaths = res.tempFilePaths;
        that.setData({
          //将临时变量赋值给已经在data中定义好的变量
          imgUrl: tempFilePaths
        })
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },
  //多张图片
  multiImg: function (e) {
    var that = this,
      //获取当前图片的下表
      index = e.currentTarget.dataset.index,
      //数据源
      pictures = this.data.pictures;
    wx.previewImage({
      //当前显示下表
      current: pictures[index],
      //数据源
      urls: pictures
    })
  },

  //页面路由
  testroute : function(){
    //wx.navigateTo(OBJECT) 保留当前页面，跳转到应用内的某个页面，使用wx.navigateBack可以返回到原页面。
    //wx.redirectTo(OBJECT) 关闭当前页面，跳转到应用内的某个页面。
    //wx.navigateBack() 关闭当前页面，回退前一页面。
    

  },

  getSystemInfo: function () {
    wx.getSystemInfo({
      success: function(res) {
        console.log(res);
      },
    })
  }
})