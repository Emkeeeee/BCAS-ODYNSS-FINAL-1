namespace account_api.Models
{
    public class ItemLogModel
    {
        public int itemlog_id { get; set; }
        public string item_uid { get; set; }
        public string dept_handler { get; set; }
        public string action { get; set; }
        public string formatted_time { get; set; }
    }
}
