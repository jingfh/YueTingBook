using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
//using Microsoft.DirectX.DirectSound;
using System.Configuration;
using System.Runtime.InteropServices;
using System.Threading;
using System.Text;
using System.IO;
using System.Media;

using NAudio;
using NAudio.Wave;
using NLayer.NAudioSupport;
using System.Diagnostics;

namespace iat
{
    /// <summary>
    /// iat 语音识别接口、
    /// 接收参数：
    /// text -> 需要识别的文本
    /// speeker -> 选择的音频发声，默认为0
    /// </summary>
    public class audio2text : IHttpHandler
    {
        private const string my_appid = "appid = 5d40f41a";
        public const string session_begin_params =
            "sub = iat, " +
            "domain = iat, " +
            "language = zh_cn, " +
            "accent = mandarin, " +
            "sample_rate = 16000, " +
            "result_type = plain, " +
            "result_encoding = gb2312";

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            HttpRequest re = context.Request;
            string mp3file = re.Form["file"];
            //string mp3file = re.QueryString["file"];

            //调用ffmpeg！！！！好用
            //ffmpeg -y -i D:\\IISLocalServer\\audios\\test.mp3 -acodec pcm_s16le -f s16le -ac 1 -ar 16000 D:\\IISLocalServer\\audios\\test3.wav
            //ffmpeg -y -i D:\\IISLocalServer\\audios\\test.mp3 -acodec pcm_s16le -f s16le -ac 1 -ar 16000 D:\\IISLocalServer\\audios\\test3.pcm

            if (mp3file != null)
            {
                if (init_audio())
                {
                    string wavfile = mp32wav(mp3file);
                    if (wavfile != null)
                    {
                        context.Response.Write(audio_iat( wavfile, session_begin_params ));
                        //context.Response.Write(wavfile);
                    }
                    else
                    {
                        context.Response.Write(".wav file is null");
                    }
                }
                else
                {
                    context.Response.Write("login fail");
                }
                if (!end_audio())
                    context.Response.Write("logout fail");
            }
            else
            {
                context.Response.Write(".mp3 file is null");
            }         
        }


        #region iat(语音听写) 
        private static bool init_audio()
        {
            int res = mscDLL.MSPLogin(null, null, my_appid);//用户名，密码，登陆信息，前两个均为空
            if (res != (int)Errors.MSP_SUCCESS)
            {//登陆失败
                return false;
            }
            return true;
        }

        #region audio2text
        /// <summary>
        /// 语音-》文本转换
        /// </summary>
        /// <param name="audio_path"></param>
        /// <param name="session_begin_params"></param>
        /// <returns></returns>
        private static string audio_iat(string audio_path, string session_begin_params)
        {
            if (audio_path == null || audio_path == "") return "";


            IntPtr session_id;
            StringBuilder result = new StringBuilder();//存储最终识别的结果
            var aud_stat = AudioStatus.MSP_AUDIO_SAMPLE_CONTINUE;//音频状态
            var ep_stat = EpStatus.MSP_EP_LOOKING_FOR_SPEECH;//端点状态
            var rec_stat = RecogStatus.MSP_REC_STATUS_SUCCESS;//识别状态
            int errcode = (int)Errors.MSP_SUCCESS;
            byte[] audio_content;  //用来存储音频文件的二进制数据
            int totalLength = 0;//用来记录总的识别后的结果的长度，判断是否超过缓存最大值



            try
            {
                audio_content = File.ReadAllBytes(audio_path);
                //SoundPlayer player = new SoundPlayer(audio_path);
                //player.Play();
            }
            catch (Exception e)
            {
                //Console.WriteLine(e);
                System.Diagnostics.Debug.WriteLine(e.Message);
                audio_content = null;
            }


            try
            {
                if (audio_content == null)
                    throw new Exception("没有读取到任何内容");
                
                //Console.WriteLine("开始进行语音听写.......");

                session_id = mscDLL.QISRSessionBegin(null, session_begin_params, ref errcode);

                if (errcode != (int)Errors.MSP_SUCCESS)
                    throw new Exception("开始一次语音识别失败！");

                int res = mscDLL.QISRAudioWrite(session_id, audio_content, (uint)audio_content.Length, aud_stat, ref ep_stat, ref rec_stat);

                if (res != (int)Errors.MSP_SUCCESS)
                    throw new Exception("写入识别的音频失败！" + res);
                
                res = mscDLL.QISRAudioWrite(session_id, null, 0, AudioStatus.MSP_AUDIO_SAMPLE_LAST, ref ep_stat, ref rec_stat);

                if (res != (int)Errors.MSP_SUCCESS)
                    new Exception("写入音频失败！" + res);
                
                while (RecogStatus.MSP_REC_STATUS_COMPLETE != rec_stat)
                {
                    IntPtr now_result = mscDLL.QISRGetResult(session_id, ref rec_stat, 0, ref errcode);

                    if (errcode != (int)Errors.MSP_SUCCESS)
                        throw new Exception("获取结果失败：" + errcode);
                    
                    if (now_result != null)
                    {
                        int length = now_result.ToString().Length;
                        totalLength += length;

                        if (totalLength > 4096)
                            throw new Exception("缓存空间不够" + totalLength);
                        
                        result.Append(Marshal.PtrToStringAnsi(now_result));
                    }
                    Thread.Sleep(150);//防止频繁占用cpu
                }
                

            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            finally
            {
                //Console.WriteLine("语音听写结束");
                //Console.WriteLine("听写结果: ");
                //Console.WriteLine(result);
                //int res = mscDLL.MSPLogout();//用户名，密码，登陆信息，前两个均为空
                
            }

            


            return result.ToString();

        }
        #endregion


        private static bool end_audio()
        {
            int res = mscDLL.MSPLogout();//用户名，密码，登陆信息，前两个均为空
            if (res != (int)Errors.MSP_SUCCESS)
            {//登陆失败
                return false;
            }
            return true;
        }
        #endregion


        #region 创建文件名及获取配置文件键值对
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


        #region 音频格式转换
        /// <summary>
        /// 音频格式转换
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public string mp32wav( string input )
        {
            //string output = input.Substring(0, input.Length - 3) + "wav";
            string absoluteUrl = GetConfigValue("AudioAbsoluteFolderTemp");//绝对路径
            string relativeUrl = GetConfigValue("AudioRelativeFolderTemp");//相对路径
            string catalog = DateTime.Now.ToString("yyyyMMdd");
            string filePath = System.IO.Path.Combine( absoluteUrl, catalog );
            if (!System.IO.Directory.Exists(filePath))
            {
                System.IO.Directory.CreateDirectory(filePath);
            }
            string fileName = CreateFileName(".wav");
            string output = System.IO.Path.Combine(filePath, fileName);
            //返回URL路径
            string returnURL = System.IO.Path.Combine(relativeUrl, catalog, fileName).Replace("\\", "/");


            string strCmd = "-y -i "+ input +" -acodec pcm_s16le -f s16le -ac 1 -ar 16000 "+output;

            System.Diagnostics.Process p = new System.Diagnostics.Process();
            p.StartInfo.FileName = "D:\\ffmpeg\\bin\\ffmpeg.exe";//要执行的程序名称 
            p.StartInfo.Arguments = " " + strCmd;
            p.StartInfo.UseShellExecute = true;
            p.StartInfo.RedirectStandardInput = false;//可能接受来自调用程序的输入信息 
            p.StartInfo.RedirectStandardOutput = false;//由调用程序获取输出信息 
            p.StartInfo.RedirectStandardError = false;//重定向标准错误输出
            p.StartInfo.CreateNoWindow = false;//不显示程序窗口

            p.Start();//启动程序

            p.WaitForExit();//等待程序执行完退出进程

            if (System.IO.File.Exists(output))
            {
                //return returnURL;
                return output;
            }
            return "";
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