using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Crawler.Models
{
    public class Menu
    {
        public string BookId { get; set; }

        public string PageIndex { get; set; }

        public string PageNum { get; set; }

        public Dictionary<int, Array> ChapterNames { get; set; }

    }
}

