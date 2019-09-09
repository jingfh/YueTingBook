using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace tts
{
    /// <summary>
    /// text 的摘要说明
    /// </summary>
    public class text2audio : IHttpHandler
    {
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string text = context.Request.Form["text"];
            //string text = context.Request.QueryString["text"];
            /*
            string text = "\r\n他对夏说道：“此衣裳似乎是天匠所造，我只能模仿一二。”\r\n（一）\r\n“模仿？天匠？”夏冷笑道:”不过就是一套衣服，" +
                "难不成还有什么奥秘，还弄出个天匠制作，我就不信。”她靠近我，她那好看的手打算碰到我的盔甲。\r\n夏怒道：“若兰小贝，把这衣服给我！" +
                "我不要他制作了，这衣服，是我的了！”她走过来抢，剧毒立刻毒到她的手，转眼间变成了黑色！\r\n夏立刻抽回手去，杨谦连忙拿出一盒针，" +
                "给她驱毒。黑色的毒液顺着针孔一滴滴掉落。\r\n“你，为何没事？”夏质问我。\r\n“我不知道，但是我也有点不舒服。”\r\n" +
                "“算了，你身上带着毒，就这样吧，这衣服我不要了，我也不稀罕。杨谦，" +
                "" +
                "" +
                "你看看，咱们府上，有什么事情，可以让这个小妖女做的，不要让她碰到" +
                "我的东西和食品，别的我都不管。”\r\n杨谦尴尬的答应着，带着我离开。\r\n（二）\r\n“若兰小贝姑娘，不要和她一般见识，此女，若不" +

                "是神界的王牌执事，我们早已不厌烦，我们都是被安排在此的，为她服务。看你气色不太好，我给你诊治一下。”\r\n他伸手，似乎要用中医手法。" +
                "\r\n“不用了，我家熙，他会的，我生病，他也有药。”\r\n“那是魔君手段，治疗怎可与神界一样？”他取出几个糖果，递到我手上。“这些，" +
                "你饿的时候，就吃吧。”\r\n“怎么，夏府不给佣人吃饭？”\r\n“不是，你的情况，太特殊了。”他说完立刻走掉。" +
                "\r\n“不行，你要告诉我，怎么回事？”我挡在他面前。\r\n“看你也是个诚实的好姑娘，但是我现在，不能告诉你。”\r\n他要说的什么？" +
                "我越发不明白了，看着他的背影离开。\r\n“还愣着干什么，你是刚来的小女佣人吗？还不快过来，给我们提水，我们要打扫楼梯台阶了。”" +
                "\r\n几个年长的胖大婶模样的佣人，在喊着我，我立刻应声过去。\r\n这些水桶，如果用一个人力抬，根本就做不到的。都是铁皮很厚" +

                "的水桶，奇怪的是每只水桶里面还加了一个铁球，说是为了惩罚在夏府的佣人用的，如此一来，本来就不轻巧的工作，" +
                "变得更加吃力。\r\n她们每天反反复复走几十趟，才可以把那座豪华的小水池添满清水，加热，" +
                "" +
                "" +
                "给夏琬晴做温泉使用。\r\n这个女人，真是很会享受！" +
                "\r\n“姐姐们，你们都松手吧，这些水桶交给我。”我使用神力，用光束变到空中，直接把水源连接水池，水流在半空中划出好看的弧度。\r\n" +
                "“谁叫你使用神力了？”隆笑走进院子。ENTER“隆笑执事好。”胖大婶们害怕的问好，然后拿起水桶，马上溜走了。\r\n“这些水桶，不用神力，" +
                "是做不到的。”\r\n“是吗？还是你力气太小？”他走近我，笑里藏刀的模样：“小贝，你想好了，如果愿意做我的妾，我今晚就可以给你自由。”";
            */
            //string text = "test测试音频";
            //string path = "D:/audios/temp/audioTest23334455.pcm";

            //保存文件路径（绝对路径）
            string catalog = DateTime.Now.ToString("yyyyMMdd");
            string filePath = System.IO.Path.Combine(GetConfigValue("AudioAbsoluteFolderTemp"), catalog);
            if (!System.IO.Directory.Exists(filePath))
            {
                System.IO.Directory.CreateDirectory(filePath);
            }
            
            //发音人
            string speeker = "";
            if (context.Request.Form["speeker"] != null)
            {
                int speekerIndex = int.Parse(context.Request.Form["speeker"]);
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
                //Text2Audio(text, audioPath, speeker);
            }
            else
            {
                //Text2Audio(text, audioPath);
            }

            //异步处理
            string returnURL = asyncText2AudioControl(text, speeker, filePath, catalog);

            //返回Url到Response
            context.Response.Write(returnURL);

        }


        /// <summary>
        /// MD5加密
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        #region MD5
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
        #endregion

        /// <summary>
        /// 使用Task.Wait()实现异步和逻辑先后顺序
        /// </summary>
        /// <param name="text"></param>
        /// <param name="speeker"></param>
        /// <param name="filePath"></param>
        /// <param name="catalog"></param>
        /// <returns></returns>
        #region asyncText2AudioControl
        public string asyncText2AudioControl(string text,string speeker,string filePath,string catalog)
        {
            
            ArrayList sText = new ArrayList();
            ArrayList sAbsolutePath = new ArrayList();
            //ArrayList sThread = new ArrayList();
            List<Task> sThread = new List<Task>();
            int gap = 333;
            for (int i = 0; i < text.Length; i += gap)
            {
                if (i + gap >= text.Length)
                    sText.Add(text.Substring(i, text.Length - i));
                else
                    sText.Add(text.Substring(i, gap));
                //sThread.Add();

            }
            //int x = 0;
            foreach (string t in sText)
            {
                Task<string> task = Task<string>.Run(() =>
                {
                    string audioName = CreateFileName(".wav");
                    string audioPath = System.IO.Path.Combine(filePath, audioName);
                    string resPath = "";
                    if (speeker != "")
                        resPath = Text2Audio(t, audioPath, speeker);
                    else
                        resPath = Text2Audio(t, audioPath);
                    //Thread.Sleep(1000);
                    return resPath;
                });
                task.Wait();
                string res = task.Result;
                if (res != "")
                    sAbsolutePath.Add(res);
                //sThread.Add( task );
                
            }
            //Task.WaitAll(sThread.ToArray());

            string mergeAudio = mergeAudios(sAbsolutePath, filePath);

            //获取（相对路径）
            string relativeUrl = GetConfigValue("AudioRelativeFolderTemp");
            string returnURL = System.IO.Path.Combine(relativeUrl, catalog, mergeAudio).Replace("\\", "/");

            return returnURL;
        }
        #endregion

        /// <summary>
        /// tts主方法
        /// </summary>
        /// <param name="text"></param>
        /// <param name="path"></param>
        /// <param name="speeker"></param>
        /// <returns></returns>
        #region Text2Audio
        public static string Text2Audio(string text,string path,string speeker = "xiaoyan")
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
            if (System.IO.File.Exists(path))
            {
                //return returnURL;
                return path;
            }
            return "";
        }
        #endregion

        /// <summary>
        /// 拼接音频
        /// </summary>
        /// <param name="list">需要合并的音频绝对路径列表</param>
        /// <param name="fileCatlog">最后的拼接音频放入的目录，也是拼接的工作区</param>
        /// <returns></returns>
        #region 合并音频
        public string mergeAudios(ArrayList list,string fileCatlog)
        {
            string mergeListName = CreateFileName(".txt");
            string mergeList = System.IO.Path.Combine(fileCatlog, mergeListName);
            FileStream fs = new FileStream(mergeList, FileMode.Create);
            StreamWriter sw = new StreamWriter(fs);
            foreach (string s in list)
            {
                sw.Write("file '"+s+ "'\r\n");
            }
            sw.Flush();//清空缓冲区
            sw.Close();
            fs.Close();

            //混合音频
            //ffmpeg -i 1.wav -i 2.wav -filter_complex amix=inputs=2:duration=first:dropout_transition=2 -f wav c.wav
            //拼接音频
            //ffmpeg.exe -i "concat:123.mp3|124.mp3" -acodec copy output.mp3
            //ffmpeg -f concat -i list.txt -c copy res.wav

            string mergeFileName = CreateFileName(".wav");
            string mergeFile = System.IO.Path.Combine(fileCatlog, mergeFileName);
            string strCmd = "-f concat -safe -0 -i " + mergeList + " -c copy " + mergeFile;

            //调用ffmpeg.exe
            System.Diagnostics.Process p = new System.Diagnostics.Process();
            p.StartInfo.FileName = "D:\\ffmpeg\\bin\\ffmpeg.exe"; 
            p.StartInfo.Arguments = " " + strCmd;
            p.StartInfo.UseShellExecute = true;
            p.StartInfo.RedirectStandardInput = false;//可能接受来自调用程序的输入信息 
            p.StartInfo.RedirectStandardOutput = false;//由调用程序获取输出信息 
            p.StartInfo.RedirectStandardError = false;//重定向标准错误输出
            p.StartInfo.CreateNoWindow = false;//不显示程序窗口
            //启动程序
            p.Start();
            //等待程序执行完退出进程
            p.WaitForExit();
            

            //删除列表txt文件
            deleteFile(mergeList,1);
            foreach(string file in list)
            {
                //删除列表txt文件
                deleteFile(file, 1);
            }

            if (System.IO.File.Exists(mergeFile))
            {
                //return returnURL;
                return mergeFile;
            }
            return "";
        }
        #endregion


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


        #region 删除文件
        public void deleteFile(string filename, int timesToWrite)
        {
            try
            {
                if (File.Exists(filename))
                {
                    //设置文件的属性为正常，这是为了防止文件是只读 
                    File.SetAttributes(filename, FileAttributes.Normal);
                    //计算扇区数目 
                    double sectors = Math.Ceiling(new FileInfo(filename).Length / 512.0);
                    // 创建一个同样大小的虚拟缓存 
                    byte[] dummyBuffer = new byte[512];
                    // 创建一个加密随机数目生成器 
                    RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
                    // 打开这个文件的FileStream 
                    FileStream inputStream = new FileStream(filename, FileMode.Open, FileAccess.Write, FileShare.ReadWrite);
                    for (int currentPass = 0; currentPass < timesToWrite; currentPass++)
                    {
                        // 文件流位置 
                        inputStream.Position = 0;
                        //循环所有的扇区 
                        for (int sectorsWritten = 0; sectorsWritten < sectors; sectorsWritten++)
                        {
                            //把垃圾数据填充到流中 
                            rng.GetBytes(dummyBuffer);
                            // 写入文件流中 
                            inputStream.Write(dummyBuffer, 0, dummyBuffer.Length);
                        }
                    }
                    // 清空文件 
                    inputStream.SetLength(0);
                    // 关闭文件流 
                    inputStream.Close();
                    // 清空原始日期需要 
                    DateTime dt = new DateTime(2037, 1, 1, 0, 0, 0);
                    File.SetCreationTime(filename, dt);
                    File.SetLastAccessTime(filename, dt);
                    File.SetLastWriteTime(filename, dt);
                    // 删除文件 
                    File.Delete(filename);
                }
            }
            catch (Exception)
            {
            }
        }
        #endregion

    }
}