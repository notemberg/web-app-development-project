// ตัวอย่างไฟล์ EmailRequest.cs

using System;
using System.Collections.Generic;

namespace MaJerGan.Models
{
    // เก็บคู่ Email + Username
    public class RecipientInfo
    {
        public string Email { get; set; }
        public string Username { get; set; }
    }

    public class EmailRequest
    {
        // เปลี่ยนให้เป็น List<RecipientInfo>
        public List<RecipientInfo> Recipients { get; set; }

        public string TemplateType { get; set; }
        public string ActivityName { get; set; }
        public DateTime? ActivityDate { get; set; }
        public string ActivityTime { get; set; }
        public string  LocationName { get; set; }
    }
}