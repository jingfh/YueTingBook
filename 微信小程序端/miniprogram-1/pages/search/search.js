// pages/search/search.js
var WxSearch = require('../../libs/wxSearchView/wxSearchView.js');
var hot = ['斗破苍穹', '盗墓笔记', "灵域", "我欲封天", '龙族', "斗罗大陆","将夜","牧神记"];
var rel = ['斗破苍穹之无上之境', "斗破苍穹之药老传奇","斗罗大陆2：绝世唐门","斗罗大陆3：龙王传说","斗罗大陆4：终极斗罗",
  "武炼巅峰", "武极天下", "修罗武神","武动乾坤",
  '龙族1：火之晨曦', '龙族2：悼亡者之瞳', '龙族3：黑月之潮', '龙族4：奥丁之渊', '龙族5：悼亡者的归来',];
Page({
  data: {
    navigationBarTitle: '小说搜索',
    
  },
  onLoad: function (options) {
    var that = this;
    WxSearch.init(
      that,  
      hot, //热点搜索推荐
      rel,//搜索匹配
      that.mySearchFunction,
      that.myGobackFunction
    );
    
  },
  wxSearchInput: WxSearch.wxSearchInput,  //输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap,  //点击提示或者关键字、历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, //删除所有的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm,  //搜索
  wxSearchClear: WxSearch.wxSearchClear,  //清空搜索历史

  //搜索  
  mySearchFunction: function (value) {
    wx.navigateTo({
      url: '../searchbaidu/searchbaidu?keyword='+value
    })

  },

  //返回
  myGobackFunction: function () {
    wx.reLaunch({
      url: '../../pages/index/index'
    })
  },

  

})