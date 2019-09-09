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
using System.Net;
using System.IO;
using System.Threading;

//Crawl.aspx?Url=https://m.88dush.com/book/127388-53640410/
//               https://m.88dush.com/book/61194-16515142/
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

        #region 解压缩网页
        /// <summary>
        /// 利用HttpWebClient的自动解压缩
        /// </summary>
        public class XWebClient : WebClient
        {
            protected override WebRequest GetWebRequest(Uri address)
            {
                HttpWebRequest request = base.GetWebRequest(address) as HttpWebRequest;
                request.AutomaticDecompression = DecompressionMethods.Deflate | DecompressionMethods.GZip;
                return request;
            }
        }
        /// <summary>
        /// 利用gzip手动解压
        /// </summary>
        /// <param name="cbytes"></param>
        /// <returns></returns>
        public static string gzFile(byte[] cbytes)
        {
            using (MemoryStream dms = new MemoryStream())
            {
                using (MemoryStream cms = new MemoryStream(cbytes))
                {
                    using (System.IO.Compression.GZipStream gzip = new System.IO.Compression.GZipStream(cms, System.IO.Compression.CompressionMode.Decompress))
                    {
                        byte[] bytes = new byte[1024];
                        int len = 0;
                        //读取压缩流，同时会被解压
                        while ((len = gzip.Read(bytes, 0, bytes.Length)) > 0)
                        {
                            dms.Write(bytes, 0, len);
                        }
                    }
                }
                return (Encoding.UTF8.GetString(dms.ToArray()));
            }
        }
        #endregion


        #region 爬虫主方法
        public static string GetContext(string url)
        {
            var novel = new Novel();
            //try
            //{

            XWebClient client = new XWebClient();
            client.Credentials = CredentialCache.DefaultCredentials;
            client.Headers.Add("user-agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36");
            byte[] page = client.DownloadData(url);
            string content = System.Text.Encoding.GetEncoding("GBK").GetString(page);
            
            //string content = GetWebText(url);

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
                    var chapter = match.Groups["text"].Value;
                    novel.Chapter += chapter;
                    //var cha = chapter.Split(' ')[1];
                    var cha = chapter;
                    var subNum1 = SubNumber(cha);
                    var subNum2 = SubNumber2(cha);
                    if (subNum1 != "")
                    {
                        var num = Convert2Number(subNum1);
                        cha = num.ToString();
                    }
                    else if (subNum2 != "")
                    {
                        cha = subNum2;
                    }
                    novel.ChapterNo += cha;
                }
                foreach (Match match in linksContext)
                {
                    novel.Context += "ENTER" + match.Groups["text"].Value;
                }
                //novel.Context = System.Web.HttpUtility.UrlEncode(novel.Context, System.Text.Encoding.GetEncoding("gb2312"));
                //var bytes = System.Text.Encoding.GetEncoding("GBK").GetBytes(novel.Context);
                //novel.Context = System.Text.Encoding.UTF8.GetString(bytes);
                //novel.Context = EnCodeCovert(novel.Context);
               
                //}
            //}
            //catch (ThreadAbortException ex)
            //{
                //不作处理          
            //}
            //finally
            //{
                //
            //}
            return Newtonsoft.Json.JsonConvert.SerializeObject(novel);
            //return string.Empty;
        }
        #endregion


        #region 数字大小写转换
        /// <summary>
        /// 从汉字字符串中截取第一个数字。
        /// </summary>
        /// <param name="src">源文本</param>
        /// <returns></returns>
        public static string SubNumber(string src)
        {
            char[] charArr = src.ToCharArray();
            char[] newCharArr = new char[charArr.Length];
            string numberString = "零一二三四五六七八九十百千";
            for (int i = 0; i < charArr.Length; i++)
            {
                newCharArr[i] = numberString.IndexOf(charArr[i]) != -1 ? '1' : '0';
            }
            string str = new string(newCharArr);
            Regex reg = new Regex("1+");
            Match m = reg.Match(str);
            if (m.Success)
            {
                return src.Substring(m.Index, m.Value.Length);
            }
            return string.Empty;
        }
        public static string SubNumber2(string src)
        {
            char[] charArr = src.ToCharArray();
            char[] newCharArr2 = new char[charArr.Length];
            string numberString2 = "0123456789";
            for (int i = 0; i < charArr.Length; i++)
            {
                newCharArr2[i] = numberString2.IndexOf(charArr[i]) != -1 ? '2' : '0';
            }
            string str2 = new string(newCharArr2);
            Regex reg2 = new Regex("2+");
            Match m2 = reg2.Match(str2);
            if (m2.Success)
            {
                return src.Substring(m2.Index, m2.Value.Length);
            }
            return string.Empty;
        }
        /// <summary>
        /// 中文转数字
        /// </summary>
        /// <param name="src">中文数字 如：九亿八千七百六十五万四千三百二十一</param>
        /// <returns></returns>
        public static int Chinese2Num(string src)
        {
            string[] srcArr;
            int result = 0;
            if (src.IndexOf("亿") != -1)
            {
                srcArr = src.Split('亿');
                result += Convert.ToInt32(Convert2Number(srcArr[0]) * Math.Pow(10, 8));
                if (src.IndexOf("万") != -1)
                {
                    srcArr = srcArr[1].Split('万');
                    result += Convert.ToInt32(Convert2Number(srcArr[0]) * Math.Pow(10, 4)) + Convert.ToInt32(Convert2Number(srcArr[1]));
                }
            }
            else
            {
                if (src.IndexOf("万") != -1)
                {
                    srcArr = src.Split('万');
                    result += Convert.ToInt32(Convert2Number(srcArr[0]) * Math.Pow(10, 4)) + Convert.ToInt32(Convert2Number(srcArr[1]));
                }
                else
                {
                    result += Convert.ToInt32(Convert2Number(src));
                }
            }
            return result;
        }
        /// <summary>
        /// 1万以内中文转数字
        /// </summary>
        /// <param name="src">源文本如：四千三百二十一</param>
        /// <returns></returns>
        public static int Convert2Number(string src)
        {
            string numberString = "零一二三四五六七八九";
            string unitString = "零十百千";
            char[] charArr = src.Replace(" ", "").ToCharArray();
            int result = 0;
            if (string.IsNullOrEmpty(src) || string.IsNullOrWhiteSpace(src))
            {
                return 0;
            }
            if (numberString.IndexOf(charArr[0]) == -1)
            {
                return 0;
            }
            for (int i = 0; i < charArr.Length; i++)
            {
                for (int j = 0; j < unitString.Length; j++)
                {
                    if (charArr[i] == unitString[j])
                    {
                        if (charArr[i] != '零')
                        {
                            result += Convert.ToInt32(int.Parse(numberString.IndexOf(charArr[i - 1]).ToString()) * Math.Pow(10, j));
                        }
                    }
                }
            }
            if (numberString.IndexOf(charArr[charArr.Length - 1]) != -1)
            {
                result += numberString.IndexOf(charArr[charArr.Length - 1]);
            }
            return result;
        }
        #endregion


        #region 网页编码转换
        /// <summary>
        /// 获取网页内容
        /// </summary>
        /// <param name="url">目标url</param>
        /// <returns>页面内容</returns>
        public static string GetWebText(string url)
        {
            string result = "编码转换失败...";
            using (WebClient client = new WebClient())
            {
                Stream stream = client.OpenRead(url);
                //using (StreamReader reader = new StreamReader(stream, client.Encoding))
                using (StreamReader reader = new StreamReader(stream, Encoding.Default))
                {
                    string text = reader.ReadToEnd();
                    MatchCollection matchs = Regex.Matches(text, "charset=(.+)");
                    if (matchs.Count > 0)
                    {
                        byte[] data = client.Encoding.GetBytes(text);
                        string charset = matchs[0].Groups[1].ToString().Trim(' ', '/', '>', '\r', '"');
                        byte[] conver = Encoding.Convert(client.Encoding, Encoding.GetEncoding(charset), data);
                        result = Encoding.GetEncoding(charset).GetString(data);
                    }
                }
            }
            return result;
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
        #endregion

    }
}