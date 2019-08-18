# YueTingBook
悦听小说（微信小程序）

## 项目介绍 
本项目是我从科大讯飞的APP“听书神器”获取的灵感，恰逢自己实习期间接触了.NET+IIS快速搭建本地服务器的技术，而且自己此时正在学习微信小程序，所以自己就开始参考“听书神器”自己写一个类似的小程序，想要实现的目标功能是：  
1、输入书名后，点击搜索接入百度搜索，这里支持语音输入搜索，后台接入的科大讯飞语音识别接口；  
2、搜索到小说后，进入小说页面，点击“转码”后进入类似市面小说软件的阅读模式；  
3、然后点击“听书”选择发声人后由后台接入的科大讯飞的语音生成接口，对小说文字识别并转化成相应发声人的语音返回用户端  

## 开发环境
（1）微信小程序：
微信开发者工具 Stable v1.02.~~1907300~~  
version: "7.0.4"（微信版本） 
SDKVersion: "2.7.7"（客户端基础库版本） 
（2）ASP.NET 
VS 2017(Microsoft Visual Studio Enterprise 2017 15.9.14) 
.NET Framework 4.6.1 
（3）IIS 
IIS 10.0(Internet Information Services 10.0.17134.1) 
（4）数据库 
SQL SERVER 2012 

## BUGs&TIPs
1.我的项目很粗糙，而且为了方便我把我做过的所有DEMO直接写在一个大Program里，这种习惯不太好，当然我觉得这样适合初学，方便总结 
2.拿来用的话记得配置两个`appID`，微信和科大讯飞 
3.界面很丑，不会设计只会复现和修改 
4.现在小程序的语音功能和小说功能是分开的（text2audio和reader），以后有时间会整合为一个完整项目 
5.目前只能PC本地调试，未部署服务器 
6.把.NET后台的IIS配置好之后，记得将小程序右上角“`详情`”里的`不校验非法域名`选项勾选 
7.除了勾选不校验选项还可以尝试内网穿透，这个我没找到合适的`ngrok`工具，官网版本显示请求超时，室友分享给我的他们实训用过的ngrok我还没试过，我会和抽时间把我在官网下载的版本一起发到下载里，有需要的自取 
8.如上文我最后没有接入百度搜索，我直接接入了88读书的小说搜索页，没有针对不同网站Url自动爬取文章的思路 
9.我的`.NET爬虫`没有进行我之前的Python爬虫那样的伪装，针对安全性高的网站可能会被封IP 
10.科大讯飞语音免费开放接口每天有500次的限额 
11.待续。。  


## 2019.08 第一版
目前完成了： 
1.后台四个主要接口的开发：
本地资源服务器、语音听写、语音生成、爬虫 
2.前台微信小程序完成了： 
88dush.com的接入，可以实现转码阅读，并对垃圾广告进行了拦截处理 
第二版目标： 
1.语音处理模块iat/tts接入 
2.界面美化
3.后台部署至服务器并发布小程序
