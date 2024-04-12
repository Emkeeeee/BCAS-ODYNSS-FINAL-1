namespace account_api.Models
{
    public class AccountLogModel
    {
        public int acclog_id { get; set; }
        public string acc_username { get; set; }
        public string admin { get; set; }
        public string action { get; set; }
        public string formatted_time { get; set; }
    }
}
