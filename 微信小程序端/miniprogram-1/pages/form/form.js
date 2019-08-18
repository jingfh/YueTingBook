// pages/form/form.js
var util = require('../../utils/util.js');
const app = getApp();
Page({

  //初始化数据
  data: {
    region: ['北京市', '北京市', '东城区'],
    //index: 0,
    date: '2018-10-20',
    time: '00:01',
    uploadImg: 'http://iislocalserver.lab.com:90/image/deimg.png',
    //productInfo: {},
    allValue: '',
  },

  //表单提交按钮
  formSubmit: function (e) {
    var alldata = e.detail.value;
    console.log('form发生了submit事件，携带数据为：', alldata);
    this.setData({
      allValue: alldata,
    });
    //数据重构
    var subdata = {};
    subdata.name = alldata.inputName;
    if (alldata.radioGender == '男'){
      //console.log('是男的');
      subdata.gender = 1;
    }else{
      subdata.gender = 0;
    }
    subdata.age = alldata.sliderAge;
    subdata.phone = alldata.inputPhone;
    subdata.addr = '';
    for(var i=0;i<3;i++){ subdata.addr += this.data.region[i]; }
    subdata.img = this.data.uploadImg;
    console.log(subdata);
    console.log('gender='+subdata.gender);
    console.log('age='+subdata.age);
    //请求后台接口
    wx.request({
      url: 'http://localhost:88/Handler3.ashx',
      data: subdata,//util.json2Form(subdata),
      /*'name='+subdata.name+
      '&gender='+subdata.gender+
      '&age='+subdata.age+
      '&phone='+subdata.phone+
      '&addr='+subdata.addr+
      '&img='+subdata.img*/
      /*{ name:subdata.name,
        gender:subdata.gender,
        age:subdata.age,
        phone:subdata.phone,
        addr:subdata.addr,
        img:subdata.img }*/
      //method: 'POST',
      header: { 
        'content-type': 'application/json' // 默认值
        //'content-type': 'application/x-www-form-urlencoded;charset=utf-8' 
        //"Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log("result:"+res.data);
      },
      fail: function (res) {
        console.log(res);
      }
    })


    //使用封装的ajax请求
    //util.ajax(url, userInfo, 'POST', res => {

    //})

  },

  //表单重置按钮
  formReset: function (e) {
    console.log('form发生了reset事件，携带数据为：', e.detail.value)
    this.setData({
      region: ['北京市', '北京市', '东城区'],
      date: '2018-10-20',
      time: '00:01',
      uploadImg: 'http://iislocalserver.lab.com:90/image/deimg.png',
      //productInfo: {},
      allValue: ''
    })
  },

  //地区选择
  bindPickerChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({ 
      region: e.detail.value 
    });
  },

  //日期选择
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  //时间选择
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },

  //图片上传
  imgUpload: function () {
    let that = this;
    var loadimg = '../images/loading.gif';
    wx.chooseImage({
      count: 1,  //最多可以选择的图片总数
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '图片上传中...',
          image:loadimg
        });
        //wx.showToast({
          //title: '图片上传中...',
          //icon: loadimg,
          //icon: 'loading',
          //mask: true,
          //duration: 10000
        //});
        wx.uploadFile({
          //url: 'http://localhost:88/Handler2.ashx',
          url: 'http://iislocalserver.lab.com:90/upload/IISLocalServer.ashx',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
          },
          header: {
            "Content-Type": "multipart/form-data"
          },
          success: function (res) {
            var data = JSON.parse(res.data);
            //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }
            console.log(data);
            that.setData({
              uploadImg: data.Url,
              //'orderData.image': res.data,
            });
            //wx.hideToast();
            wx.hideLoading();
          },
          fail: function (res) {
            //wx.hideToast();
            wx.hideLoading();
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function (res) { }
            })
          }
        });
      }
    })
  },

})
