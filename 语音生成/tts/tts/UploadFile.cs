/// <summary>
/// 上传文件 返回数据模型
/// </summary>
namespace tts
{
    public class UploadFile
    {
        /// <summary>
            /// 目录名称
            /// </summary>
        public string Catalog { set; get; }
        /// <summary>
            /// 文件名称，包括扩展名
            /// </summary>
        public string FileName { set; get; }
        /// <summary>
            /// 浏览路径
            /// </summary>
        public string Url { set; get; }
        /// <summary>
            /// 上传的文件编号(提供给前端判断文件是否全部上传完)
            /// </summary>
        public int FileIndex { get; set; }
    }

}