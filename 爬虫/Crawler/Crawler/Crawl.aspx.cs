using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Crawler.Models;
using System.Text;

namespace Crawler
{
    public partial class Crawl1 : System.Web.UI.Page
    {
        private static readonly HttpClient client = new HttpClient();
        //string novelUrl { get { return Request.QueryString["Url"] ?? ""; } }
        string novelUrl { get { return Request.Form["Url"] ?? ""; } }
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                //if(Request.QueryString["userId"] != null){
                if (novelUrl != null)
                {
                    Response.ClearContent();
                    Response.ContentType = "text/plain";
                    //1.局部变量，可行
                    //Response.Write("参数 = " + Request.QueryString["userId"].ToString());
                    //2.全局变量，可行
                    //Response.Write( downHtml(novelUrl) );
                    Response.Write(GetContext(novelUrl));
                }
                else
                {
                    Response.Write("参数不存在！");
                }

                //1.排除ThreadAbortException异常
                Response.End();

                //2.InVisible
                //this.Page.Visible = false;
                //Context.ApplicationInstance.CompleteRequest();
            }
            catch (System.Threading.ThreadAbortException)
            {
                //1.
            }
            catch (Exception ex)
            {
                Response.Write(ex);
            }

        }

        public static string GetContext(string url)
        {
            var novel = new Novel();
            System.Net.WebClient client = new System.Net.WebClient();
            byte[] page = client.DownloadData(url);
            string content = System.Text.Encoding.GetEncoding("GBK").GetString(page);
            //HttpClient httpClient = new HttpClient();
            //HttpResponseMessage res = httpClient.GetAsync(url).Result;
            //if (res.IsSuccessStatusCode)
            //{
            //Task<string> t = res.Content.ReadAsStringAsync();
                //string content = t.Result;
                //content = EnCodeCovert(content);
                var linkChapter = Regex.Matches
                (
                    content,
                    @"<div[^>]+class=""nr_title""\sid=""nr_title"">(?<text>.*?)</div>",
                    //@"""><a[^>]+href=""*(?<href>/hotel/[^>\s]+)""\s*data-dopost[^>]*><span[^>]+>.*?</span>(?<text>.*?)</a>"
                    //"<a     href=     <href>/hotel/[    ]            >  <text>             </a>",
                    //<div class="nr_title" id="nr_title"> 第一千八百二十三章 封界十万年！（终）</div>
                    RegexOptions.IgnoreCase
                );
                var linkBook = Regex.Matches
                (
                    content,
                    @"<title>(?<text>.*?)</title>",
                    //@"<h1><a\s*id=""bookname"">(?<text>.*?)</a>",
                    //@"""><a[^>]+href=""*(?<href>/hotel/[^>\s]+)""\s*data-dopost[^>]*><span[^>]+>.*?</span>(?<text>.*?)</a>"
                    //"<a     href=     <href>/hotel/[    ]            >  <text>             </a>",
                    //<h1><a href="/info/78738/" id="bookname">超级武神</a></h1>
                    RegexOptions.IgnoreCase
                );
                var linksContext = Regex.Matches
                (
                    content,
                    @"(&nbsp;){4}(?<text>.*?)<br />",
                    //"<a     href=     <href>/hotel/[    ]            >  <text>             </a>",
                    //&nbsp;&nbsp;&nbsp;&nbsp;“聂天！”<br />
                    RegexOptions.IgnoreCase
                );
                foreach (Match match in linkBook)
                {
                    novel.Book += match.Groups["text"].Value.Split('-')[1];

                }
                foreach (Match match in linkChapter)
                {
                    novel.Chapter += match.Groups["text"].Value;
                    
                }
                foreach (Match match in linksContext)
                {
                    novel.Context += match.Groups["text"].Value+ "ENTER";
                }
                //novel.Context = System.Web.HttpUtility.UrlEncode(novel.Context, System.Text.Encoding.GetEncoding("gb2312"));
                //var bytes = System.Text.Encoding.GetEncoding("GBK").GetBytes(novel.Context);
                //novel.Context = System.Text.Encoding.UTF8.GetString(bytes);
                //novel.Context = EnCodeCovert(novel.Context);
                return Newtonsoft.Json.JsonConvert.SerializeObject(novel);
            //}
            //return string.Empty;
        }
        private static string EnCodeCovert(string value)
        {
            System.Text.Encoding srcEncode = System.Text.Encoding.GetEncoding("gb2312");
            System.Text.Encoding convToEncode = System.Text.Encoding.Default;
            byte[] bytes = srcEncode.GetBytes(value);
            System.Text.Encoding.Convert(srcEncode, convToEncode, bytes, 0, bytes.Length);
            return convToEncode.GetString(bytes);
        }

        private static string EnCodeCovert2(string str)
        {
            byte[] buffer = Encoding.Default.GetBytes(str);
            byte[] buffers = Encoding.Convert(Encoding.Default, Encoding.UTF8, buffer);
            return  Encoding.UTF8.GetString(buffers);
        }

        private static string downHtml(string Url)
        {
            var data = new System.Net.WebClient { }.DownloadData(Url); //根据textBox1的网址下载html
            var r_utf8 = new System.IO.StreamReader(new System.IO.MemoryStream(data), Encoding.UTF8); //将html放到utf8编码的StreamReader内
            var r_gbk = new System.IO.StreamReader(new System.IO.MemoryStream(data), Encoding.Default); //将html放到gbk编码的StreamReader内
            var t_utf8 = r_utf8.ReadToEnd(); //读出html内容
            var t_gbk = r_gbk.ReadToEnd(); //读出html内容
            if (!isLuan(t_utf8)) //判断utf8是否有乱码
            {
                
                return "utf8";
            }
            return "gbk";
            //web.RespnseHeaders.Get("Content-Type")
        }
        private static bool isLuan(string txt)
        {
            var bytes = Encoding.UTF8.GetBytes(txt);
            //239 191 189
            for (var i = 0; i < bytes.Length; i++)
            {
                if (i < bytes.Length - 3)
                    if (bytes[i] == 239 && bytes[i + 1] == 191 && bytes[i + 2] == 189)
                    {
                        return true;
                    }
            }
            return false;
        }
    }
}