using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
//using System.Web.Http;

namespace IISLocalServer
{
    /// <summary>
    /// IISLocalServer 的摘要说明
    /// </summary>
    public class IISLocalServer : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";

            HttpFileCollection files = context.Request.Files;
            HttpPostedFile file = files["file"];

            context.Response.Write( UploadFileNew(file) );
        }

        //[HttpPost]
        public string UploadFileNew(HttpPostedFile file)
        {
            UploadFile model = new UploadFile();
            
            if (file != null)
            {
                //公司编号+上传日期文件主目录
                model.Catalog = DateTime.Now.ToString("yyyyMMdd");

                //获取文件后缀
                string extensionName = System.IO.Path.GetExtension(file.FileName);

                //文件名
                model.FileName = System.Guid.NewGuid().ToString("N") + extensionName;

                //保存文件路径
                string absoluteUrl = "";
                string relativeUrl = "";
                switch (extensionName) {
                    case ".jpg":
                    case ".gif":   
                    case ".png":
                        absoluteUrl = GetConfigValue("ImageAbsoluteFolderTemp");//绝对路径
                        relativeUrl = GetConfigValue("ImageRelativeFolderTemp");//相对路径
                        break;
                    case ".mp3":
                    case ".wav":
                    case ".pcm":
                        absoluteUrl = GetConfigValue("AudioAbsoluteFolderTemp");//绝对路径
                        relativeUrl = GetConfigValue("AudioRelativeFolderTemp");//相对路径
                        break;
                }

                string filePathName = System.IO.Path.Combine( absoluteUrl, model.Catalog );
                if (!System.IO.Directory.Exists(filePathName))
                {
                    System.IO.Directory.CreateDirectory(filePathName);
                }
                file.SaveAs(System.IO.Path.Combine(filePathName, model.FileName));
                
                //获取临时文件绝对完整路径
                model.LocalUrl = System.IO.Path.Combine(filePathName, model.FileName);
                //获取临时文件相对完整路径
                model.Url = System.IO.Path.Combine(relativeUrl, model.Catalog, model.FileName).Replace("\\", "/");
            }
            return Newtonsoft.Json.JsonConvert.SerializeObject(model);
        }


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