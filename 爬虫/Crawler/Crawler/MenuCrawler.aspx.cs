using Crawler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

//MenuCrawler.aspx?BookId=127388&PageIndex=1
namespace Crawler
{
    public partial class MenuCrawler : System.Web.UI.Page
    {
        //string novelId { get { return Request.QueryString["BookId"] ?? ""; } }
        //string menuIndex { get { return Request.QueryString["PageIndex"] ?? ""; } }
        string novelId { get { return Request.Form["BookId"] ?? ""; } }
        string menuIndex { get { return Request.Form["PageIndex"] ?? ""; } }
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                if (novelId != null)
                {
                    Response.ClearContent();
                    Response.ContentType = "text/plain";
                    Response.Write(GetContext(novelId, menuIndex));
                }
                else
                {
                    Response.Write("参数不存在！");
                }
                Response.End();
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

        public static string GetContext(string Id,string Index)
        {
            if (Index == null) Index = "1";
            string url = "https://m.88dush.com/mulu/" + Id + "-" + Index + "/";
            var menu = new Models.Menu
            {
                BookId = Id,
                PageIndex = Index,
                ChapterNames = new Dictionary<int, Array>() { },
            };
            
            System.Net.WebClient client = new System.Net.WebClient();
            byte[] page = client.DownloadData(url);
            string content = System.Text.Encoding.GetEncoding("GBK").GetString(page);

            var linkChapters = Regex.Matches
            (
                content,
                @"<a\shref=(?<href>.*?)>(?<text>.*?)<span></span></a>",
                //<a[^>]+href=""*(?<href>/hotel/[^>\s]+)""\s*[^>]*>(?<text>(?!.*img).*?)</a>
                //<li><a href='/book/98276-33831511/'>第31章 大鱼海棠<span></span></a></li>
                RegexOptions.IgnoreCase
            );
            var linkPageNum = Regex.Matches
            (
                content,
                @"><a[^>]+href=""*(?<page>.*?)""[^>]*>(?<text>.*?)</a>",
                //<a href="/mulu/98276-47/">尾页</a>
                RegexOptions.IgnoreCase
            );
            int n = 0;
            foreach (Match match in linkChapters)
            {
                n = n + 1;
                var BookUrl = "https://m.88dush.com/book/" + match.Groups["href"].Value.Split('/')[2] + "/";
                var BookChapter = match.Groups["text"].Value;
                var cha = BookChapter;
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
                string[] arr = { cha, BookUrl, BookChapter };
                menu.ChapterNames.Add(n, arr);
            }
            foreach (Match match in linkPageNum)
            {
                if (match.Groups["text"].Value == "尾页")
                    menu.PageNum += match.Groups["page"].Value.Split('/')[2].Split('-')[1];
            }
            return Newtonsoft.Json.JsonConvert.SerializeObject(menu);
        }

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





    }
}