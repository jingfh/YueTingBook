using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

namespace tts
{
    /// <summary>
    /// text 的摘要说明
    /// </summary>
    public class text2audio : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string text = context.Request.Form["text"];
            //string text = context.Request.QueryString["text"];


            //string text = "test测试音频";
            //string path = "D:/audios/temp/audioTest23334455.pcm";

            //保存文件路径（绝对路径）
            string catalog = DateTime.Now.ToString("yyyyMMdd");
            string filePath = System.IO.Path.Combine(GetConfigValue("AudioAbsoluteFolderTemp"), catalog);
            if (!System.IO.Directory.Exists(filePath))
            {
                System.IO.Directory.CreateDirectory(filePath);
            }
            string audioName = CreateFileName(".wav");
            string audioPath = System.IO.Path.Combine(filePath , audioName);
            //发音人
            if (context.Request.Form["speeker"] != null)
            {
                int speekerIndex = int.Parse(context.Request.Form["speeker"]);
                string speeker = "";
                switch (speekerIndex)
                {
                    case 0:
                        speeker = "xiaoyan";
                        break;
                    case 1:
                        speeker = "aisjiuxu";
                        break;
                    case 2:
                        speeker = "aisxping";
                        break;
                    case 3:
                        speeker = "aisjinger";
                        break;
                    case 4:
                        speeker = "aisbabyxu";
                        break;
                    default:
                        speeker = "xiaoyan";
                        break;
                }
                Text2Audio(text, audioPath, speeker);
            }
            else
            {
                Text2Audio(text, audioPath);
            }

            //获取（相对路径）
            string relativeUrl = GetConfigValue("AudioRelativeFolderTemp");
            string returnURL = System.IO.Path.Combine(relativeUrl, catalog, audioName).Replace("\\", "/");

            //返回到Response里
            context.Response.Write(returnURL);

        }

        public static String Md5(string s)
        {
            System.Security.Cryptography.MD5 md5 = new System.Security.Cryptography.MD5CryptoServiceProvider();
            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(s);
            bytes = md5.ComputeHash(bytes);
            md5.Clear();
            string ret = "";
            for (int i = 0; i < bytes.Length; i++)
            {
                ret += Convert.ToString(bytes[i], 16).PadLeft(2, '0');
            }
            return ret.PadLeft(32, '0');
        }

        public static void Text2Audio(string text,string path,string speeker = "xiaoyan")
        {
            // 应用APPID（必须为webapi类型应用，并开通语音合成服务，参考帖子如何创建一个webapi应用：http://bbs.xfyun.cn/forum.php?mod=viewthread&tid=36481）
            string appID = "5d40f41a";
            // 接口密钥（webapi类型应用开通合成服务后，控制台--我的应用---语音合成---相应服务的apikey）
            string APIKey = "b8f254d2495d70a22852de6c6ec1bfc4";
            // 语音合成webapi接口地址
            String url = "http://api.xfyun.cn/v1/service/v1/tts";
            String bodys;
            // 待合成文本
            //string text = "test测试音频";
            // 对要合成语音的文字先用utf-8然后进行URL加密
            byte[] textData = Encoding.UTF8.GetBytes(text);
            text = HttpUtility.UrlEncode(textData);
            bodys = string.Format("text={0}", text);


            //aue = raw, 音频文件保存类型为 wav或者pcm
            //aue = lame, 音频文件保存类型为 mp3
            string AUE = "raw";
            string param =
                "{\"aue\":\"" + AUE + "\","+
                "\"auf\":\"audio/L16;rate=16000\","+
                "\"voice_name\":\"" + speeker + "\"," +
                "\"engine_type\":\"intp65\"}";
            // 获取十位的时间戳
            TimeSpan ts = DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, 0);
            string curTime = Convert.ToInt64(ts.TotalSeconds).ToString();
            // 对参数先utf-8然后用base64编码
            byte[] paramData = Encoding.UTF8.GetBytes(param);
            string paraBase64 = Convert.ToBase64String(paramData);
            // 形成签名
            string checkSum = Md5(APIKey + curTime + paraBase64);
            // 组装http请求头
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.Headers.Add("X-Param", paraBase64);
            request.Headers.Add("X-CurTime", curTime);
            request.Headers.Add("X-Appid", appID);
            request.Headers.Add("X-CheckSum", checkSum);

            Stream requestStream = request.GetRequestStream();
            StreamWriter streamWriter = new StreamWriter(requestStream, Encoding.GetEncoding("gb2312"));
            streamWriter.Write(bodys);
            streamWriter.Close();

            String htmlStr = string.Empty;
            HttpWebResponse response = request.GetResponse() as HttpWebResponse;
            Stream responseStream = response.GetResponseStream();
            using (StreamReader reader = new StreamReader(responseStream, Encoding.GetEncoding("UTF-8")))
            {
                string header_type = response.Headers["Content-Type"];
                if (header_type == "audio/mpeg")
                {
                    Stream st = response.GetResponseStream();
                    MemoryStream memoryStream = StreamToMemoryStream(st);
                    // 保存音频文件地址和音频格式类型
                    //string path = "D:/audios/temp/audioTest23334455.pcm";
                    File.WriteAllBytes(path, streamTobyte(memoryStream));


                    ////////////////////////////
                    //Console.WriteLine(response.Headers);
                    //Console.ReadLine();
                }
                else
                {
                    htmlStr = reader.ReadToEnd();
                    //Console.WriteLine(htmlStr);
                    //Console.ReadLine();
                }
            }
            responseStream.Close();

        }



        #region 把流转换成缓存流
        static MemoryStream StreamToMemoryStream(Stream instream)
        {
            MemoryStream outstream = new MemoryStream();
            const int bufferLen = 4096;
            byte[] buffer = new byte[bufferLen];
            int count = 0;
            while ((count = instream.Read(buffer, 0, bufferLen)) > 0)
            {
                outstream.Write(buffer, 0, count);
            }
            return outstream;
        }
        #endregion

        #region 把缓存流转换成字节组
        public static byte[] streamTobyte(MemoryStream memoryStream)
        {
            byte[] buffer = new byte[memoryStream.Length];
            memoryStream.Seek(0, SeekOrigin.Begin);
            memoryStream.Read(buffer, 0, buffer.Length);
            return buffer;
        }
        #endregion



        #region 创建文件名
        /// <summary>
        /// 创建文件名
        /// </summary>
        /// <param name="extensionName"></param>
        /// <returns></returns>
        public string CreateFileName(string extensionName)
        {
            string name = System.Guid.NewGuid().ToString("N") + extensionName;
            return name;
        }
        #endregion

        #region 获取配置文件Key对应Value值
        /// <summary>
        /// 获取配置文件Key对应Value值
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static string GetConfigValue(string key)
        {
            return ConfigurationManager.AppSettings[key].ToString();
        }
        #endregion



        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}