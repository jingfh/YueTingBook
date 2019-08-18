using System;
using System.Collections.Generic;
using System.Collections;
using System.Text.RegularExpressions;
using System.Linq;
using System.Web;
using Crawler.Models;

namespace Crawler
{
    /// <summary>
    /// Crawl 的摘要说明
    /// </summary>
    public class Crawl : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string novelUrl = context.Request.QueryString["Url"];
            //string novelUrl = context.Request.Form["Url"];
            if (novelUrl != null)
            {
                context.Response.Write(novelCrawler(novelUrl));
            }
            else
            {
                context.Response.Write("参数为空");
            }
        }

        public static string novelCrawler(string novelUrl)
        {
            var novel = new Novel();
            var novelCrawler = new SimpleCrawler();
            string returnJSON = "";
            novelCrawler.OnStart += (s, e) =>
            {
                //Console.WriteLine("爬虫开始抓取地址：" + e.Uri.ToString());
            };
            novelCrawler.OnError += (s, e) =>
            {
                returnJSON = ("爬虫抓取出现错误：" + e.Uri.ToString() + "，异常消息：" + e.Exception.Message);
            };
            novelCrawler.OnCompleted += (s, e) =>
            {
                var link = Regex.Matches
                (
                    e.PageSource,
                    @"<div[^>]+class=""nr_title""\s*[^>]*>(?<text>(?!.*img).*?)</div>",
                   //"<a     href=     <href>/hotel/[    ]            >  <text>             </a>",
                    //<div class="nr_title" id="nr_title"> 第一千八百二十三章 封界十万年！（终）</div>
                    RegexOptions.IgnoreCase
                );
                var links = Regex.Matches
                (
                    e.PageSource,
                    @"(&nbsp;){4}(?<text>(?!.*img).*?)<br />",
                    //"<a     href=     <href>/hotel/[    ]            >  <text>             </a>",
                    //&nbsp;&nbsp;&nbsp;&nbsp;“聂天！”<br />
                    RegexOptions.IgnoreCase
                );
                foreach (Match match in links)
                {
                    novel.Chapter = match.Groups["text"].Value;
                    //Console.WriteLine(city.CityName + "|" + city.Uri);//将城市名称及URL显示到控制台
                }
                foreach (Match match in links)
                {
                    novel.Context += match.Groups["text"].Value;
                }
                //Console.WriteLine("===============================================");
                //Console.WriteLine("爬虫抓取任务完成！合计 " + links.Count + " 个城市。");
                //Console.WriteLine("耗时：" + e.Milliseconds + "毫秒");
                //Console.WriteLine("线程：" + e.ThreadId);
                //Console.WriteLine("地址：" + e.Uri.ToString());
                returnJSON = Newtonsoft.Json.JsonConvert.SerializeObject(novel);

            };
            novelCrawler.Start(new Uri(novelUrl)).Wait();//没被封锁就别使用代理：60.221.50.118:8090
            return returnJSON;
        }

        public bool IsReusable { get { return false; } }
    }
}